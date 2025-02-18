const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Import nodemailer for email functionality

// Initialize the secret key from the environment variable
const algorithm = 'aes-256cbc';
const secretKey = process.env.SECRET_KEY; // Get this from .env file
if (!secretKey) {
    console.error('Secret key not found');
    process.exit(1); // Exit the app if the key is not found
}
console.log(`Secret Key: ${secretKey}`);


const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 300000, // 10 seconds timeout
    socketTimeout: 30000,
    greetingTimeout: 30000,
});




transporter.verify((error, success) => {
    if (error) {
        console.error('Error with transporter verification:', error);
    } else {
        console.log('Server is ready to take our messages:', success);
    }
});

const verificationCodes = {}; // To store temporary verification codes for users


// Encrypt function
const encrypt = (text) => {
    const iv = crypto.randomBytes(16); // Generate a random IV for each encryption
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
    cipher.setAutoPadding(true);  // Explicitly set padding
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    console.log(`Encryption - IV: ${iv.toString('hex')}, Encrypted Data: ${encrypted}`);

    return { iv: iv.toString('hex'), encryptedData: encrypted };
};

const decrypt = (encryptedData, iv) => {
    if (!encryptedData || !iv) {
        throw new Error('Invalid input to decrypt function');
    }

    try {
        const keyBuffer = Buffer.from(secretKey, 'hex');
        const ivBuffer = Buffer.from(iv, 'hex');

        console.log(`Decrypting with IV: ${iv}, Encrypted Data: ${encryptedData}, Secret Key: ${secretKey}`);

        const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
        decipher.setAutoPadding(true);  // Explicitly set padding
        let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Decryption failed');
    }
};


const port = 3000;
app.use(cors());
app.use(bodyParser.json());

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'password_manager';

client.connect().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

// Function to send verification email
const sendVerificationEmail = (email, code) => {
    console.log(`Sending email to ${email} with code ${code}`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Copy Verification Code',
        text: `Your verification code is ${code}. Please enter it to proceed with copying the password.`,
    };

    return transporter.sendMail(mailOptions)
        .then(info => {
            console.log('Email sent:', info.response);
        })
        .catch(error => {
            console.error('Failed to send email:', error);
            console.error('Error details:', error.response || error.message); // Additional logging
            throw new Error('Error sending verification email');
        });
};

let ogcode = 1221;

// Endpoint to request verification code
app.post('/request-verification', (req, res) => {
    const {email} = req.body;
    console.log(email)
    // const email = process.env.DEFAULT_EMAIL; // Use the static email address
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
    ogcode = verificationCode;
    // Log the generated verification code for troubleshooting (remove in production)
    console.log(`Generated verification code: ${verificationCode}`);
console.log(process.env.EMAIL_USER,process.env.EMAIL_PASS,process.env.DEFAULT_EMAIL)
    verificationCodes[email] = verificationCode;

    sendVerificationEmail(email, verificationCode)
        .then(() => res.json({ success: true, message: 'Verification code sent' }))
        .catch((error) => {
            console.error('Error sending verification email:', error);
            res.status(500).json({ success: false, message: 'Failed to send verification code' });
        });
});

// Endpoint to verify the code
app.post('/verify-code', (req, res) => {
    const { email, code } = req.body;
    if (ogcode === code) {
        console.log('whdhwjd')
        delete verificationCodes[email]; // Clear the code once used
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
});

// GET endpoint to retrieve all passwords
app.get('/', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const findResult = await collection.find({}).toArray();

        console.log('Found documents:', findResult); // Log found documents

        const decryptedResults = findResult.map(item => {
            console.log('Item before decryption:', item);
            
            // Check if password is in the expected format
            if (typeof item.password === 'string') {
                console.error('Password is a hashed string:', item.password);
                return { ...item, password: 'Decryption failed: password is hashed' }; // Handle hashed password
            }

            if (!item.password || !item.password.encryptedData || !item.password.iv) {
                console.error('Missing password fields in item:', item);
                return { ...item, password: 'Decryption failed: missing fields' }; // Handle missing fields
            }

            // Decrypt if all fields are present
            try {
                const decryptedPassword = decrypt(item.password.encryptedData, item.password.iv);
                console.log(`Decrypted password for ${item.site}: ${decryptedPassword}`); // Print decrypted password

                return {
                    ...item,
                    password: decryptedPassword
                };
            } catch (error) {
                console.error('Decryption failed for item:', item);
                return { ...item, password: 'Decryption failed' };
            }
        });

        res.json(decryptedResults); // Send decrypted data
    } catch (error) {
        console.error('Error retrieving passwords:', error);
        res.status(500).send({ success: false, message: 'Error retrieving passwords' });
    }
});


// POST endpoint to add a new password
app.post('/', async (req, res) => {
    try {
        const { site, username, password, id } = req.body;
        const encryptedPassword = encrypt(password);

        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const insertResult = await collection.insertOne({
            site,
            username,
            password: {
                iv: encryptedPassword.iv,
                encryptedData: encryptedPassword.encryptedData
            },
            id
        });
        res.status(201).send({ success: true, result: insertResult });
    } catch (error) {
        console.error('Error saving password:', error);
        res.status(500).send({ success: false, message: 'Error saving password' });
    }
});

// DELETE endpoint to delete a password
app.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the id from the request parameters
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) }); // Use ObjectId for MongoDB
        res.send({ success: true, result: deleteResult });
    } catch (error) {
        console.error('Error deleting password:', error);
        res.status(500).send({ success: false, message: 'Error deleting password' });
    }
});

// POST endpoint to save generated password
app.post('/generated-passwords', async (req, res) => {
    try {
        const { password, id } = req.body;
        const encryptedPassword = encrypt(password); // Encrypt the generated password

        const db = client.db(dbName);
        const collection = db.collection('generated_passwords'); // New collection
        const insertResult = await collection.insertOne({
            password: {
                iv: encryptedPassword.iv,
                encryptedData: encryptedPassword.encryptedData
            },
            id
        });
        res.status(201).send({ success: true, result: insertResult });
    } catch (error) {
        console.error('Error saving generated password:', error);
        res.status(500).send({ success: false, message: 'Error saving generated password' });
    }
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

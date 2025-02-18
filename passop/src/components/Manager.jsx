import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
  const ref = useRef();
  const passwordRef = useRef();
  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwordsArray, setPasswordsArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [copyPassword, setCopyPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
const [passwordStrength,setPasswordStrength]= useState("");

  const checkPasswordStrength = (password) => {
    let strength = "Weak";
    if (password.length > 8 && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*]/.test(password)) {
      strength = "Strong";
    } else if (password.length > 6 && /[A-Z]/.test(password) && /\d/.test(password)) {
      strength = "Medium";
    }
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newPass = e.target.value;
    setForm({ ...form, password: newPass });
    checkPasswordStrength(newPass);
  };

  const getPasswords = async () => {
    setLoading(true);
    try {
      let req = await fetch("http://localhost:3000/");
      let passwords = await req.json();
      setPasswordsArray(passwords);
    } catch (error) {
      toast.error("Error fetching passwords");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPasswords();
  }, []);

  const showPassword = () => {
    if (ref.current.src.includes("notvisible.png")) {
      ref.current.src = "visible.png";
      passwordRef.current.type = "text";
    } else {
      ref.current.src = "notvisible.png";
      passwordRef.current.type = "password";
    }
  };

  const savePassword = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:3000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: uuidv4() }),
      });
      toast.success("Password saved successfully");
      setPasswordsArray([...passwordsArray, { ...form, id: uuidv4() }]);
      setForm({ site: "", username: "", password: "" });
    } catch (error) {
      toast.error("Error saving password");
    } finally {
      setLoading(false);  
    }
  };

const requestVerificationCode = async (password,email) => {
   setCopyPassword(password); // Store password to copy after verification
   console.log(email)
   try {
       await fetch("http://localhost:3000/request-verification", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ email: email }), // Static email
       });
       console.log("hi")
       toast.success("Verification code sent to the default email");
       setShowVerificationInput(true); // Show verification input
   } catch (error) {
       toast.error("Error sending verification code");
   }
};



  const verifyCode = async () => {
    try {
      console.log('Email:', email, 'Code:', verificationCode);

        const response = await fetch("http://localhost:3000/verify-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email:"jebinjj5724@gmail.com", code: verificationCode }),
        });
        const result = await response.json();
        if (result.success) {
            toast.success("Code verified! Password copied to clipboard");
            navigator.clipboard.writeText(copyPassword); // Copy the password
            setShowVerificationInput(false);
        } else {
            toast.error("Incorrect verification code");
        }
    } catch (error) {
        toast.error("Error verifying code");
    }
  };



const handleVerificationCodeChange = (e) => {
  setVerificationCode(e.target.value);
};

  const deletePassword = async (id) => {
    let confirmDelete = window.confirm("Do you really want to delete this password?");
    if (confirmDelete) {
      setLoading(true);
      try {
        await fetch("http://localhost:3000/", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        setPasswordsArray(passwordsArray.filter(item => item.id !== id));
        toast.success("Password deleted successfully");
      } catch (error) {
        toast.error("Error deleting password");
      } finally {
        setLoading(false);
      }
    }
  };

  const editPassword = (id) => {
    const passwordToEdit = passwordsArray.find(i => i.id === id);
    setForm({ ...passwordToEdit });
    setPasswordsArray(passwordsArray.filter(item => item.id !== id));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const copyText = (text) => {
    toast('Copied to clipboard', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
    navigator.clipboard.writeText(text);
  };

  // Function to generate a random password
  const generatePassword = async () => {
    const length = 12; // Length of the password
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    // Save the generated password to the server
    await saveGeneratedPassword(password); // Call the new function
    setForm({ ...form, password }); // Update the form state with the generated password
    toast.success("Generated a new password!");
};

const saveGeneratedPassword = async (password) => {
  setLoading(true);
  try {
      await fetch("http://localhost:3000/generated-passwords", { // New endpoint
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, id: uuidv4() }), // Include ID
      });
  
  } catch (error) {
  } finally {
      setLoading(false);
  }
};

  return (
    <>
      <ToastContainer />
      <div className="relative h-full w-full bg-white">
      <div class="absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>
      <div className="mycontainer">
        <h1 className="text-4xl text-white">
          <span className="text-green-500">&lt;</span>
          Pass
          <span className="text-green-500">OP/&gt;</span>
        </h1>
        <p className="text-green-400 text-lg text-center ">
          Your password manager
        </p>

        <div className="text-black flex flex-col px-2 text-black gap-8 items-center">
          <input
            name="site"
            value={form.site}
            onChange={handleChange}
            className="rounded-full py-1.5 border border-green-500 w-full p-4 py-1 pb-2"
            type="text"
            placeholder="Enter the URL of the site"
          />
          

<div className="flex w-full flex-col md:flex-row justify-between items-center gap-8">
  {/* Username Input */}
  <input
    name="username"
    value={form.username}
    onChange={handleChange}
    placeholder="Enter your email"
    className="rounded-full border py-1.5 border-green-500 w-full md:w-auto flex-1 p-4 pl-6 pb-2"
    type="text"
  />

  {/* Password Input with Show/Hide Toggle */}
  <div className="relative w-full md:w-auto flex-1">
    <input
      name="password"
      value={form.password}
      onChange={handleChange}
      placeholder="Enter password/Generate"
      className="rounded-full border py-1.5 border-green-500 w-full p-4 pb-2"
      type="password"
      ref={passwordRef}
    />
    <span
      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
      onClick={showPassword}
    >
      <img
        ref={ref}
        src="notvisible.png"
        alt="eye"
        width={30}
        className="p-1"
      />
    </span>
  </div>

  <div className={`text-${passwordStrength === 'Strong' ? 'green-500' : passwordStrength === 'Medium' ? 'yellow-500' : 'red-500'}`}>
            Password Strength: {passwordStrength}
          </div>
  

  {/* Generate Button with Icon */}
  <button
    onClick={generatePassword}
    className="flex justify-center pl-4 border hover:border-green-800 items-center bg-green-500 rounded-full px-6 py-2.5 w-full md:w-auto hover:bg-green-600 transition-all duration-300 ease-in-out"
  >
    <script src="https://cdn.lordicon.com/lordicon.js"></script>
    <lord-icon
      src="https://cdn.lordicon.com/wkvacbiw.json"
      trigger="hover"
      style={{ width: '30px', height: '30px' }}
    ></lord-icon>
    <span className="ml-2 text-black">Generate</span>
  </button>
</div>


          <div>
          <button
              onClick={savePassword}
              className="flex justify-center gap-1 items-center hover:border-green-800 hover:bg-green-600 bg-green-500 rounded-full px-6 py-3 pt-2.5 w-fit hover:bg-green-300"
            >
              <lord-icon
                src="https://cdn.lordicon.com/jgnvfzqg.json"
                trigger="hover"
                style={{ width: '25px', height: '20px' }} 
              ></lord-icon>
              {loading ? "Saving..." : "Save"}
            </button>


  
</div>

          <div className="passwords">
          {showVerificationInput && (
                <div className="flex justify-center">
                   
                   
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={handleVerificationCodeChange}
                        className="rounded-full border py-1.5 border-green-500 w-full p-4 pb-"
                    />
                    <button onClick={verifyCode} className="flex justify-center gap-1 items-center hover:border-green-800 hover:bg-green-600 bg-green-500 rounded-full px-6 py-3 pt-2.5 w-fit hover:bg-green-300">
                        Verify
                    </button>
                </div>
            )}
            <h2 className="font-bold text-xl py-4">Your passwords</h2>
            {passwordsArray.length === 0 && <div>No passwords to show</div>}
            {passwordsArray.length !== 0 && (
              <div className="overflow-auto max-h-60">
                <table className="table-auto w-full rounded-md overflow-hidden">
                  <thead className="bg-green-800 text-white">
                    <tr>
                      <th className="py-2">Website</th>
                      <th className="py-2">Username</th>
                      <th className="py-2">Password</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-green-100">
                    {passwordsArray.map((item) => (
                      <tr key={item.id}>
                        <td className="py-5 border border-white text-center w-32">
                          <a href={item.site} target="_blank" rel="noopener noreferrer">
                            {item.site}
                          </a>
                          <div className="cursor-pointer" onClick={() => copyText(item.site)}>
                            <lord-icon
                              src="https://cdn.lordicon.com/depeqmsz.json"
                              trigger="hover"
                              style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }}
                            ></lord-icon>
                          </div>
                        </td>
                        <td className="py- border border-white text-center w-32">
                          {item.username}
                          <div className="cursor-pointer" onClick={() => copyText(item.username)}>
                            <lord-icon
                              src="https://cdn.lordicon.com/depeqmsz.json"
                              trigger="hover"
                              style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }}
                            ></lord-icon>
                          </div>
                        </td>
                        <td className="py-2 border border-white text-center w-32 cursor-pointer">
                          <span>{"*".repeat(item.password.length)}</span>
                            <lord-icon
                            onClick={() => requestVerificationCode(item.password,item.username)}
                              src="https://cdn.lordicon.com/depeqmsz.json"
                              trigger="hover"
                              style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }}
                            ></lord-icon>
                          
                        </td>
                        <td className="py-2 border border-white text-center w-32">
                          
                          <span className="cursor-pointer" onClick={() => deletePassword(item.id)}>
                            <lord-icon
                              src="https://cdn.lordicon.com/skkahier.json"
                              trigger="hover"
                              style={{ width: "25px", height: "25px" }}
                            />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
    </>
  );
};

export default Manager;

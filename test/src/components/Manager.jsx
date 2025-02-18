import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
  const ref = useRef(); 
  const passwordRef = useRef();
  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwordsArray, setPasswordsArray] = useState([]);

  useEffect(() => {
    let passwords = localStorage.getItem("passwords");
    if (passwords) {
      setPasswordsArray(JSON.parse(passwords));
    }
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

  const savePassword = () => {
    const updatedPasswords = [...passwordsArray, {...form,id:uuidv4()}];
    setPasswordsArray(updatedPasswords);
    localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
    setForm({site: "", username:"", password:""})
  };

  const deletePassword = (id) => {
    let c=confirm("Do u really want to delete this password?")
    if(c){
      setPasswordsArray(passwordsArray.filter(item=>item.id !==id));
      localStorage.setItem("passwords", JSON.stringify(passwordsArray.filter(item=>item.id !==id)));
    }
  };

  const editPassword = (id) => {
   
    
    setForm(passwordsArray.filter(i=>i.id===id)[0])
    setPasswordsArray(passwordsArray.filter(item=>item.id !==id))

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
      progress: undefined,
      theme: "light",
      
      });
    navigator.clipboard.writeText(text);
  };

  return (
    <>
    <ToastContainer
position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
transition= "Bounce,"/>
{/* Same as */}
<ToastContainer />
      <div className="relative h-full w-full bg-white">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>
      <div className="mycontainer">
        <h1 className="text-4xl">
          <span className="text-green-500">&lt;</span>
          Pass
          <span className="text-green-500">OP/&gt;</span>
        </h1>
        <p className="text-green-700 text-lg text-center">
          Your password manager
        </p>

        <div className="text-white flex flex-col p-4 text-black gap-8 items-center">
          <input
            name="site"
            value={form.site}
            onChange={handleChange}
            className="rounded-full border border-green-500 w-full p-4 py-1"
            type="text"
            placeholder="Enter the URL of the site"
          />

          <div className="flex w-full justify-between gap-8">
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter the username"
              className="rounded-full border border-green-500 w-full p-4 py-1"
              type="text"
            />

            <div className="relative">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter the password"
                className="rounded-full border border-green-500 w-full p-4 py-1"
                type="password"
                ref={passwordRef}
              />
              <span
                className="absolute right-0 top-0 cursor-pointer"
                onClick={showPassword}
              >
                <img
                  ref={ref}
                  src="notvisible.png"
                  alt="eye"
                  width={40}
                  className="p-3"
                />
              </span>
            </div>

            <button
              onClick={savePassword}
              className="flex justify-center items-center bg-green-500 rounded-full px-2 py-2 w-fit hover:bg-green-300"
            >
              <lord-icon
                src="https://cdn.lordicon.com/jgnvfzqg.json"
                trigger="hover"
              ></lord-icon>
              Save
              </button>
          </div>

          <div className="passwords">
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
                    {passwordsArray.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2 border border-white text-center w-32">
                          <a href={item.site} target="_blank">
                            {item.site}
                          </a>
                          <div
                            className="cursor-pointer"
                            onClick={() => copyText(item.site)}
                          >
                            <lord-icon
                              src="https://cdn.lordicon.com/depeqmsz.json"
                              trigger="hover"
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                                paddingLeft: "3px",
                              }}
                            ></lord-icon>
                          </div>
                        </td>
                        <td className="py-2 border border-white text-center w-32">
                          {item.username}
                          <div
                            className="cursor-pointer"
                            onClick={() => copyText(item.username)}
                          >
                            <lord-icon
                              src="https://cdn.lordicon.com/depeqmsz.json"
                              trigger="hover"
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                                paddingLeft: "3px",
                              }}
                            ></lord-icon>
                          </div>
                        </td>
                        <td className="py-2 border border-white text-center w-32">
                          {item.password}
                          <div
                            className="cursor-pointer"
                            onClick={() => copyText(item.password)}
                          >
                            <lord-icon
                              src="https://cdn.lordicon.com/depeqmsz.json"
                              trigger="hover"
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                                paddingLeft: "3px",
                              }}
                            ></lord-icon>
                          </div>
                        </td>

                        <td className="py-2 border border-white text-center w-32">
                          <span className="cursor-pointer" onClick={()=>{editPassword(item.id)}}>
<lord-icon
    src="https://cdn.lordicon.com/qnpnzlkk.json"
    trigger="hover"
    style={{"width":"25px","height":"25px"}}>
</lord-icon></span>
<span className="cursor-pointer " onClick={()=>{deletePassword(item.id)}}>
<lord-icon
    src="https://cdn.lordicon.com/skkahier.json"
    trigger="hover"
    style={{"width":"25px","height":"25px"}}>
</lord-icon></span>
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

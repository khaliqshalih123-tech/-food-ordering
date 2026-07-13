import './LoginPopup.css'
import React, { useState, useContext } from 'react'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const LoginPopup = ({setShowLogin}) => {

    const [currState, setCurrState] = useState("Login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login, register } = useContext(StoreContext);

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        let result;
        if (currState === "Login") {
            result = await login(email, password);
        } else {
            result = await register(name, email, password);
        }

        if (result.success) {
            setShowLogin(false);
        } else {
            setError(result.message);
        }
        setLoading(false);
    }

    const switchState = (newState) => {
        setCurrState(newState);
        setError("");
        setName("");
        setEmail("");
        setPassword("");
    }

  return (
    <div className="login-popup">
      <form onSubmit={onSubmit} className="login-popup-container">
        <div className="login-popup-title">
            <h2>{currState}</h2>
            <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>
        <div className="login-popup-inputs">
            {currState==="Login"?<></>:<input onChange={(e)=>setName(e.target.value)} value={name} type="text" placeholder='Your name' required />}
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Your email' required />
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' required />
        </div>
        {error && <p className="login-popup-error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Please wait..." : currState==="Sign Up" ? "Create account" : "Login"}</button>
        <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        {currState==="Login"
        ?<p>Create a new account? <span onClick={()=>switchState("Sign Up")}>Click here</span></p>
        :<p>Already have an account? <span onClick={()=>switchState("Login")}>Login here</span></p>
        }
      </form>
    </div>
  )
}

export default LoginPopup

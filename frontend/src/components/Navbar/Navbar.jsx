import React, { useState, useContext } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext'
import SearchBar from '../SearchBar/SearchBar'


const Navbar = ({setShowLogin}) => {

    const [menu,setMenu] = useState("home");
    const [showProfile, setShowProfile] = useState(false);

    const {getTotalCartAmount, token, user, logout} = useContext(StoreContext);

  return (
    <div className='navbar'>        
        <Link to='/'><img src={assets.logo} alt="" className="logo" /></Link>
        <ul className="navbar-menu">
            <Link to='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>home</Link>
            <a href='#explore-menu' onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>menu</a>
            <a href='#app-download' onClick={()=>setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>mobile-app</a>
            <a href='#footer' onClick={()=>setMenu("contact-us")} className={menu==="contact-us"?"active":""}>contact us</a>
        </ul>
        <div className="navbar-right">
            <div className="navbar-search">
                <SearchBar compact />
            </div>
            <div className="navbar-search-icon">
                <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
                <div className={getTotalCartAmount()===0?"":"dot"}></div>
            </div>
            {!token
                ? <button onClick={()=>setShowLogin(true)}>sign in</button>
                : <div className="navbar-profile">
                    <img src={assets.profile_icon} alt="" className="profile" onClick={()=>setShowProfile(!showProfile)} />
                    {showProfile && <div className="navbar-profile-dropdown">
                        <div className="navbar-profile-user">
                            <p className="navbar-profile-name">{user?.name}</p>
                            <p className="navbar-profile-email">{user?.email}</p>
                        </div>
                        <hr />
                        <Link to='/myorders' onClick={()=>setShowProfile(false)}>
                            <img src={assets.bag_icon} alt="" /> My Orders
                        </Link>
                        <hr />
                        <Link to='/admin' onClick={()=>setShowProfile(false)}>
                            <img src={assets.profile_icon} alt="" /> Admin Panel
                        </Link>
                        <hr />
                        <p onClick={()=>{logout(); setShowProfile(false);}}>
                            <img src={assets.logout_icon} alt="" /> Logout
                        </p>
                    </div>}
                </div>
            }
        </div>
    </div>
  )
}

export default Navbar

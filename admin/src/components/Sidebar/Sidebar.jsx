import React from 'react'
import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>Bite<span>Up</span></h2>
        <p className="sidebar-subtitle">Admin Panel</p>
      </div>
      <div className="sidebar-menu">
        <NavLink to="/add" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="sidebar-icon">+</span>
          <span>Add Items</span>
        </NavLink>
        <NavLink to="/list" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="sidebar-icon">&#9776;</span>
          <span>List Items</span>
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="sidebar-icon">&#9993;</span>
          <span>Orders</span>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import AddItem from './pages/AddItem/AddItem'
import ListItems from './pages/ListItems/ListItems'
import Orders from './pages/Orders/Orders'

const App = () => {
  return (
    <div className="admin-app">
      <Sidebar />
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AddItem />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/list" element={<ListItems />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Admin from './pages/Admin/Admin'
import MyOrders from './pages/MyOrders/MyOrders'
import OrderSuccess from './pages/OrderSuccess/OrderSuccess'
import SearchResults from './pages/SearchResults/SearchResults'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'

const App = () => {

  const [showlogin,setShowLogin] = React.useState(false)
  return (
    <>
    {showlogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          < Route path='/' element={<Home/>} />
          <Route path='/cart' element={<Cart/>} />
          < Route path='/order' element={<PlaceOrder/>} />
          <Route path='/search' element={<SearchResults/>} />
          <Route path='/admin' element={<Admin/>} />
          <Route path='/myorders' element={<MyOrders/>} />
          <Route path='/order/success' element={<OrderSuccess/>} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App

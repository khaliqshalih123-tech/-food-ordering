import React, { useEffect, useContext } from 'react'
import './OrderSuccess.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const OrderSuccess = () => {

  const { token } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className='order-success'>
      <div className="order-success-content">
        <div className="order-success-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#2a9d8f" strokeWidth="4" fill="#f0faf8"/>
            <path d="M24 42L34 52L56 28" stroke="#2a9d8f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your order. Your order is being processed.</p>
        <div className="order-success-buttons">
          <button onClick={() => navigate('/myorders')}>View My Orders</button>
          <button onClick={() => navigate('/')} className="order-success-secondary">Continue Shopping</button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess

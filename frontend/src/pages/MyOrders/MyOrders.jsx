import React, { useEffect, useState, useContext } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const MyOrders = () => {

  const { getUserOrders, token, food_list } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    loadOrders();
  }, [token]);

  const loadOrders = async () => {
    setLoading(true);
    const result = await getUserOrders();
    if (result.success) {
      setOrders(result.orders.reverse());
    }
    setLoading(false);
  }

  const getItemImage = (itemId) => {
    const item = food_list.find((f) => f._id === itemId);
    return item ? item.image : null;
  }

  if (!token) return null;

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      {loading ? (
        <p className="my-orders-loading">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="my-orders-empty">
          <p>No orders yet</p>
          <button onClick={() => navigate('/')}>Browse Menu</button>
        </div>
      ) : (
        <div className="my-orders-list">
          {orders.map((order) => (
            <div key={order._id} className="my-order-card">
              <div className="my-order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="my-order-item">
                    <img src={getItemImage(item.itemId)} alt="" />
                    <div>
                      <p className="my-order-item-name">{item.name}</p>
                      <p className="my-order-item-qty">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="my-order-details">
                <p className="my-order-amount"><b>Total: ${order.amount}</b></p>
                <p className="my-order-address">
                  {order.address?.firstName} {order.address?.lastName}<br />
                  {order.address?.street}, {order.address?.city}
                </p>
                <p className="my-order-items-count">{order.items.length} item(s)</p>
                <p className="my-order-date">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div className="my-order-status">
                <span className={`my-order-status-badge ${order.status === "Delivered" ? "delivered" : order.status === "Out for delivery" ? "out" : "processing"}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders

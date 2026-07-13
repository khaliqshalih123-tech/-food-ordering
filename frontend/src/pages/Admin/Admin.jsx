import React, { useEffect, useState, useContext } from 'react'
import './Admin.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const Admin = () => {

  const { getAllOrders, updateOrderStatus, user } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    const result = await getAllOrders();
    if (result.success) {
      setOrders(result.orders.reverse());
    }
    setLoading(false);
  }

  const handleStatusChange = async (orderId, newStatus) => {
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Food Processing": return "#ff6b35";
      case "Out for delivery": return "#f4a261";
      case "Delivered": return "#2a9d8f";
      default: return "#888";
    }
  }

  if (!user) return null;

  return (
    <div className='admin'>
      <h2>Order Management</h2>
      {loading ? (
        <p className="admin-loading">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="admin-empty">No orders yet</p>
      ) : (
        <div className="admin-orders-list">
          <div className="admin-orders-header">
            <p>#</p>
            <p>User</p>
            <p>Items</p>
            <p>Amount</p>
            <p>Address</p>
            <p>Status</p>
            <p>Date</p>
          </div>
          <hr />
          {orders.map((order, index) => (
            <div key={order._id} className="admin-order-row">
              <p>{index + 1}</p>
              <p className="admin-order-user">{order.userId?.substring(0, 8)}...</p>
              <p className="admin-order-items">
                {order.items.map((item, i) => (
                  <span key={i}>{item.name}{i < order.items.length - 1 ? ", " : ""}</span>
                ))}
              </p>
              <p><b>${order.amount}</b></p>
              <p className="admin-order-address">
                {order.address?.firstName} {order.address?.lastName}<br />
                {order.address?.street}, {order.address?.city}<br />
                {order.address?.state} {order.address?.zipCode}<br />
                {order.address?.country}<br />
                {order.address?.phone}
              </p>
              <p>
                <select
                  className="admin-status-select"
                  style={{ borderColor: getStatusColor(order.status) }}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option value="Food Processing">Food Processing</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </p>
              <p>{new Date(order.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Admin

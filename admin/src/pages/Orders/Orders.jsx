import React, { useEffect, useState } from 'react'
import './Orders.css'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/order/list')
      const data = await response.json()
      if (data.success) {
        setOrders(data.data.reverse())
      }
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch('/api/order/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      })
      const data = await response.json()
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        )
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Food Processing': return '#ff6b35'
      case 'Out for delivery': return '#f4a261'
      case 'Delivered': return '#2a9d8f'
      default: return '#888'
    }
  }

  return (
    <div className="orders-page">
      <h2>Orders</h2>
      {loading ? (
        <p className="orders-loading">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="orders-empty">No orders yet.</p>
      ) : (
        <div className="orders-table">
          <div className="orders-header">
            <p>#</p>
            <p>Customer</p>
            <p>Items</p>
            <p>Qty</p>
            <p>Amount</p>
            <p>Status</p>
            <p>Date</p>
          </div>
          <hr />
          {orders.map((order, index) => (
            <div key={order._id} className="orders-row">
              <p className="orders-index">{index + 1}</p>
              <div className="orders-customer">
                <p className="orders-customer-id">{order.userId?.substring(0, 10)}...</p>
                <p className="orders-customer-address">
                  {order.address?.street}, {order.address?.city}
                </p>
              </div>
              <div className="orders-items-list">
                {order.items.map((item, i) => (
                  <p key={i}>{item.name}</p>
                ))}
              </div>
              <p className="orders-qty">{order.items.length}</p>
              <p className="orders-amount"><b>${order.amount}</b></p>
              <div className="orders-status">
                <select
                  className="orders-status-select"
                  style={{ borderColor: getStatusColor(order.status) }}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option value="Food Processing">Food Processing</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <p className="orders-date">{new Date(order.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders

import React, { useEffect, useState } from 'react'
import './ListItems.css'

const ListItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/food/list')
      const data = await response.json()
      if (data.success) {
        setItems(data.data)
      }
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  const removeItem = async (id) => {
    try {
      const response = await fetch(`/api/food/remove/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        setItems((prev) => prev.filter((item) => item._id !== id))
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="list-items">
      <h2>All Menu Items</h2>
      {loading ? (
        <p className="list-items-loading">Loading items...</p>
      ) : items.length === 0 ? (
        <p className="list-items-empty">No items found. Add some items first.</p>
      ) : (
        <>
          <p className="list-items-count">{items.length} item(s)</p>
          <div className="list-items-grid">
            {items.map((item) => (
              <div key={item._id} className="list-item-card">
                <div className="list-item-image">
                  <img src={`/images/${item.image}`} alt={item.name} />
                </div>
                <div className="list-item-info">
                  <p className="list-item-name">{item.name}</p>
                  <p className="list-item-price">${item.price}</p>
                  <p className="list-item-category">{item.category}</p>
                </div>
                <button className="list-item-remove" onClick={() => removeItem(item._id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ListItems

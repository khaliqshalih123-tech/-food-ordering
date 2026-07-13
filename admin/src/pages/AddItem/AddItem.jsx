import React, { useState } from 'react'
import './AddItem.css'

const AddItem = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Salad')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const categories = ['Salad', 'Rolls', 'Deserts', 'Sandwich', 'Cake', 'Pure Veg', 'Pasta', 'Noodles']

  const onImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('price', price)
    formData.append('category', category)
    formData.append('image', image)

    try {
      const response = await fetch('/api/food/add', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Item added successfully!')
        setIsError(false)
        setName('')
        setDescription('')
        setPrice('')
        setCategory('Salad')
        setImage(null)
        setPreview(null)
      } else {
        setMessage(data.message || 'Failed to add item')
        setIsError(true)
      }
    } catch {
      setMessage('Error connecting to server')
      setIsError(true)
    }
    setLoading(false)
  }

  return (
    <div className="add-item">
      <h2>Add New Item</h2>
      {message && <p className={`add-item-message ${isError ? 'error' : 'success'}`}>{message}</p>}
      <form onSubmit={onSubmit} className="add-item-form">
        <div className="add-item-image-section">
          <label htmlFor="image-upload" className="add-item-image-upload">
            {preview ? (
              <img src={preview} alt="Preview" className="add-item-image-preview" />
            ) : (
              <div className="add-item-image-placeholder">
                <span>+</span>
                <p>Upload Image</p>
              </div>
            )}
          </label>
          <input id="image-upload" type="file" accept="image/*" onChange={onImageChange} hidden required />
        </div>
        <div className="add-item-fields">
          <div className="add-item-field">
            <label>Item Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter item name" required />
          </div>
          <div className="add-item-field">
            <label>Item Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter item description" rows="3" required />
          </div>
          <div className="add-item-row">
            <div className="add-item-field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="add-item-field">
              <label>Price ($)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
            </div>
          </div>
          <button type="submit" className="add-item-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddItem

import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {

  const { getTotalCartAmount, token, cartItems, food_list, user, placeOrder, getAddresses } = useContext(StoreContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  const [saveAddress, setSaveAddress] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (token) {
        const result = await getAddresses();
        if (result.success) {
          setSavedAddresses(result.addresses);
        }
      }
    };
    loadAddresses();
  }, [token]);

  useEffect(() => {
    if (user) {
      setData((prev) => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
    setSelectedAddress(null);
  }

  const selectSavedAddress = (addr) => {
    setSelectedAddress(addr);
    setData({
      firstName: addr.firstName,
      lastName: addr.lastName,
      email: addr.email,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      phone: addr.phone,
    });
  }

  const placeOrderHandler = async (event) => {
    event.preventDefault();

    if (!data.firstName || !data.lastName || !data.email || !data.street || !data.city || !data.state || !data.zipCode || !data.country || !data.phone) {
      setError("Please fill all delivery information fields");
      return;
    }

    setLoading(true);
    setError("");

    const items = [];
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        items.push({
          itemId: itemInfo._id,
          name: itemInfo.name,
          price: itemInfo.price,
          quantity: cartItems[item],
          image: itemInfo.image?.src || itemInfo.image
        });
      }
    }

    const orderData = {
      items,
      amount: getTotalCartAmount() + 2,
      address: data,
      saveAddress
    };

    const result = await placeOrder(orderData);
    setLoading(false);

    if (result.success) {
      navigate('/order/success');
    } else {
      setError(result.message);
    }
  }

  if (!token) return null;

  return (
    <form onSubmit={placeOrderHandler} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        {savedAddresses.length > 0 && (
          <div className="saved-addresses">
            <p className="saved-addresses-title">Saved Addresses</p>
            {savedAddresses.map((addr, index) => (
              <div
                key={index}
                className={`saved-address-item ${selectedAddress === addr ? 'selected' : ''}`}
                onClick={() => selectSavedAddress(addr)}
              >
                <p><b>{addr.firstName} {addr.lastName}</b></p>
                <p>{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                <p>{addr.country}</p>
                <p>{addr.phone}</p>
              </div>
            ))}
          </div>
        )}

        <div className="multi-fields">
          <input name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' required />
          <input name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' required />
        </div>
        <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' required />
        <input name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' required />
        <div className="multi-fields">
          <input name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' required />
          <input name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' required />
        </div>
        <div className="multi-fields">
          <input name='zipCode' onChange={onChangeHandler} value={data.zipCode} type="text" placeholder='Zip code' required />
          <input name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' required />
        </div>
        <input name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' required />

        <div className="save-address-check">
          <input
            type="checkbox"
            checked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
          />
          <p>Save this address for future orders</p>
        </div>
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          {error && <p className="place-order-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Placing Order..." : "CONFIRM ORDER"}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder

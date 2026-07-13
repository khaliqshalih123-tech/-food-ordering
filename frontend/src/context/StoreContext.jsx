import { createContext, useState, useEffect } from "react"
import { food_list } from '../assets/assets';

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [user, setUser] = useState(null);

    const url = "http://localhost:4000";

    const loadUserProfile = async () => {
        if (token) {
            try {
                const response = await fetch(`${url}/api/user/profile`, {
                    method: "GET",
                    headers: { token }
                });
                const data = await response.json();
                if (data.success) {
                    setUser(data.user);
                } else {
                    localStorage.removeItem("token");
                    setToken("");
                    setUser(null);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    useEffect(() => {
        if (token) {
            loadUserProfile();
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${url}/api/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                setToken(data.token);
                localStorage.setItem("token", data.token);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch {
            return { success: false, message: "Error connecting to server" };
        }
    }

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${url}/api/user/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (data.success) {
                setToken(data.token);
                localStorage.setItem("token", data.token);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch {
            return { success: false, message: "Error connecting to server" };
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
    }

    const addToCart = (itemId) => {
        if (cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }))
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
    }

    const clearCart = () => {
        setCartItems({});
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const placeOrder = async (orderData) => {
        try {
            const response = await fetch(`${url}/api/order/place`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    token
                },
                body: JSON.stringify(orderData)
            });
            const data = await response.json();
            if (data.success) {
                clearCart();
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch {
            return { success: false, message: "Error connecting to server" };
        }
    }

    const getUserOrders = async () => {
        try {
            const response = await fetch(`${url}/api/order/userorders`, {
                method: "POST",
                headers: { token }
            });
            const data = await response.json();
            if (data.success) {
                return { success: true, orders: data.data };
            } else {
                return { success: false, message: data.message };
            }
        } catch {
            return { success: false, message: "Error connecting to server" };
        }
    }

    const getAllOrders = async () => {
        try {
            const response = await fetch(`${url}/api/order/list`);
            const data = await response.json();
            if (data.success) {
                return { success: true, orders: data.data };
            } else {
                return { success: false, message: data.message };
            }
        } catch {
            return { success: false, message: "Error connecting to server" };
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch(`${url}/api/order/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status })
            });
            const data = await response.json();
            return data;
        } catch {
            return { success: false, message: "Error connecting to server" };
        }
    }

    const getAddresses = async () => {
        try {
            const response = await fetch(`${url}/api/order/addresses`, {
                method: "GET",
                headers: { token }
            });
            const data = await response.json();
            if (data.success) {
                return { success: true, addresses: data.data };
            } else {
                return { success: false, message: data.message };
            }
        } catch {
            return { success: false, message: "Error connecting to server" };
        }
    }

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalCartAmount,
        token,
        setToken,
        user,
        login,
        register,
        logout,
        url,
        placeOrder,
        getUserOrders,
        getAllOrders,
        updateOrderStatus,
        getAddresses
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;

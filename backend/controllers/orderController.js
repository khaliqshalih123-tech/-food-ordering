import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const placeOrder = async (req, res) => {
    try {
        const { items, amount, address, saveAddress } = req.body;
        const userId = req.userId;

        const newOrder = new orderModel({
            userId,
            items,
            amount,
            address
        });
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        if (saveAddress) {
            const user = await userModel.findById(userId);
            if (user) {
                const addressExists = user.addresses.some(
                    (a) => a.street === address.street && a.city === address.city && a.zipCode === address.zipCode
                );
                if (!addressExists) {
                    await userModel.findByIdAndUpdate(userId, {
                        $push: { addresses: address }
                    });
                }
            }
        }

        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const saveAddress = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(req.userId, {
            $push: { addresses: req.body.address }
        });
        res.json({ success: true, message: "Address Saved" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

const getAddresses = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        res.json({ success: true, data: user.addresses });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { placeOrder, listOrders, userOrders, updateStatus, saveAddress, getAddresses }

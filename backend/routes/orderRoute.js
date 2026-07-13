import express from "express";
import { placeOrder, listOrders, userOrders, updateStatus, saveAddress, getAddresses } from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.get("/list", listOrders);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.post("/status", updateStatus);
orderRouter.get("/addresses", authMiddleware, getAddresses);
orderRouter.post("/save-address", authMiddleware, saveAddress);

export default orderRouter;

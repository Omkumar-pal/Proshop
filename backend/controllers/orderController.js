import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";

// @desc create new order
// @route POST /api/products
// @access private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order Items");
    return;
  } else {
    const sanitizedOrderItems = orderItems.map((item) => ({
      ...item,
      image:
        typeof item.image === "string"
          ? item.image
          : `/api/products/${item.product}/image`,
    }));

    const order = new Order({
      orderItems: sanitizedOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc GET ORDER BY ID
// @route GET /api/orders/:id
// @access private
const getOrderByID = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order Not Found");
  }
});

// @desc UPDATE order to paid
// @route GET /api/orders/:id/pay
// @access private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    // Prefer PayPal timestamp if available, otherwise use server time
    if (req.body && req.body.update_time) {
      // PayPal returns an ISO timestamp string like "2025-12-11T10:59:16Z"
      order.paidAt = new Date(req.body.update_time);
    } else {
      order.paidAt = Date.now();
    }

    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    // debug log on server to confirm paidAt exists before sending response
    console.log("Updated order after pay:", {
      _id: updatedOrder._id,
      isPaid: updatedOrder.isPaid,
      paidAt: updatedOrder.paidAt,
      updatedAt: updatedOrder.updatedAt,
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order Not Found");
  }
});

// @desc UPDATE order to paid
// @route GET /api/orders/:id/pay
// @access private
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order Not Found");
  }
});

// @desc Get logged in user orders
// @route GET /api/orders/myorders
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  // `req.user._id` comes from protect middleware (JWT auth)
  const orders = await Order.find({ user: req.user._id });

  res.json(orders);
});

// @desc Get all orders
// @route GET /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");

  res.json(orders);
});

export {
  addOrderItems,
  getOrderByID,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
};

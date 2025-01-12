import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { NewOrderRequestBody } from "../types/types.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utitlity-class.js";
import { redis, redisTTL } from "../app.js";

export const myOrders = TryCatch(async (req, res, next) => {
  const user = req.query.user;
  const key = `my-orders-${user}`;
  let orders;
  orders = await redis.get(key);
  if(orders) orders = JSON.parse(orders);
  else {
    orders =  await Order.find({ user });
    await redis.setex(key, redisTTL, JSON.stringify(orders));
  }
  return res.status(200).json({
    success: true,
    data: orders,
    message: "Orders found successfully",
  });
});

export const allOrders = TryCatch(async (req, res, next) => {
  const key = "all-orders";
  let orders;
  orders = await redis.get(key);
  if (orders) orders = JSON.parse(orders);
  else {
    orders = await Order.find().populate("user", "name");
    await redis.setex(key, redisTTL, JSON.stringify(orders));
  }
  return res.status(200).json({
    success: true,
    data: orders,
    message: "Orders found successfully",
  });
});

export const getOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const key = `order-${id}`;
  let order;
  order = await redis.get(key);
  if (order) order = JSON.parse(order);
  else {
    order = await Order.findById(id);
    await redis.setex(key, redisTTL, JSON.stringify(order));
  }
  return res.status(200).json({
    success: true,
    data: order,
    message: "Orders found successfully",
  });
});

export const newOrder = TryCatch(
  async (
    req: Request<{}, {}, NewOrderRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      shippingCharges,
      tax,
      discount,
      total,
    } = req.body;

    if (
      !shippingInfo ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0 ||
      !user ||
      !subtotal ||
      !tax ||
      !total
    ) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    const newOrder = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      shippingCharges,
      tax,
      discount,
      total,
    });

    await reduceStock(orderItems);

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      productId: newOrder.orderItems.map((i) => String(i.productId)),
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  }
);

export const processOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order not found!", 404));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    orderId: String(order._id),
    userId: order.user,
  });

  return res.status(200).json({
    success: true,
    data: order.status,
    message: "Order status updated successfully!",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("Order not found!", 404));

  await order.deleteOne();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    orderId: String(order._id),
    userId: order.user,
  });

  return res.status(200).json({
    success: true,
    message: "Order deleted successfully!",
  });
});

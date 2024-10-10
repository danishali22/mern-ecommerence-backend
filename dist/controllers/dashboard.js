import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage } from "../utils/features.js";
export const getDashboardStats = TryCatch(async (req, res, next) => {
    const key = "admin-stats";
    let stats;
    // Check if stats are already cached
    if (myCache.has(key)) {
        stats = JSON.parse(myCache.get(key));
    }
    else {
        // Calculate time ranges for this and last month
        const today = new Date();
        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today,
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0),
        };
        // Create promises for data fetching
        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        });
        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        });
        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        });
        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        });
        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        });
        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        });
        // Await all promises in parallel
        const [thisMonthProducts, lastMonthProducts, thisMonthUsers, lastMonthUsers, thisMonthOrders, lastMonthOrders, productsCount, usersCount, allOrders,] = await Promise.all([
            thisMonthProductsPromise,
            lastMonthProductsPromise,
            thisMonthUsersPromise,
            lastMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
        ]);
        // Calculate this and last month revenue
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.toObject().total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.toObject().total || 0), 0);
        // Calculate percentage changes
        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length)
        };
        const revenue = allOrders.reduce((total, order) => total + (order.toObject().total || 0), 0);
        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length,
        };
        // Store calculated stats in the `stats` variable
        stats = { changePercent, count };
        // Cache the calculated stats for future requests
        myCache.set(key, JSON.stringify(stats));
    }
    // Return stats in the response
    return res.status(200).json({
        success: true,
        data: stats,
    });
});
export const getPieCharts = TryCatch(async (req, res, next) => {
});
export const getBarCharts = TryCatch(async (req, res, next) => {
});
export const getLineCharts = TryCatch(async (req, res, next) => {
});

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
        // const lastSixMonths = new Date(today.getFullYear(), today.getMonth() - 6);
        const lastSixMonths = new Date();
        lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);
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
            },
        });
        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastSixMonths,
                $lte: today,
            },
        });
        // Await all promises in parallel
        const [thisMonthProducts, lastMonthProducts, thisMonthUsers, lastMonthUsers, thisMonthOrders, lastMonthOrders, productsCount, usersCount, allOrders, lastSixMonthOrders, categories,] = await Promise.all([
            thisMonthProductsPromise,
            lastMonthProductsPromise,
            thisMonthUsersPromise,
            lastMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            Product.distinct("category"),
        ]);
        // Calculate this and last month revenue
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.toObject().total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.toObject().total || 0), 0);
        // Calculate percentage changes
        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
        };
        // Calculate all orders revenue
        const revenue = allOrders.reduce((total, order) => total + (order.toObject().total || 0), 0);
        // Calculate count
        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length,
        };
        // Last 6 Months Orders count and revenue
        const orderMonthlyCount = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);
        lastSixMonthOrders.forEach((order) => {
            const orderCreation = order.toObject().createdAt;
            const monthDiff = today.getMonth() - orderCreation.getMonth();
            if (monthDiff < 6) {
                orderMonthlyCount[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        });
        // Fetch Category and its count in stock
        const categoriesCountPromise = categories.map((category) => Product.countDocuments({ category }));
        const categoriesCount = await Promise.all(categoriesCountPromise);
        const categoryCount = [];
        categories.forEach((category, i) => {
            categoryCount.push({
                [category]: Math.round((categoriesCount[i] / productsCount) * 100),
            });
        });
        // Store calculated stats in the `stats` variable
        stats = {
            categoryCount,
            changePercent,
            count,
            chart: { order: orderMonthlyCount, revenue: orderMonthlyRevenue },
        };
        // Cache the calculated stats for future requests
        myCache.set(key, JSON.stringify(stats));
    }
    // Return stats in the response
    return res.status(200).json({
        success: true,
        data: stats,
    });
});
export const getPieCharts = TryCatch(async (req, res, next) => { });
export const getBarCharts = TryCatch(async (req, res, next) => { });
export const getLineCharts = TryCatch(async (req, res, next) => { });

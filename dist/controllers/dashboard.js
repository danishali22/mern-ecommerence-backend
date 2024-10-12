import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage, getCharData, getInventories } from "../utils/features.js";
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
        const latestTransactionsPromise = Order.find({})
            .select(["_id", "orderItems", "discount", "total", "status"])
            .limit(4);
        // Await all promises in parallel
        const [thisMonthProducts, lastMonthProducts, thisMonthUsers, lastMonthUsers, thisMonthOrders, lastMonthOrders, productsCount, usersCount, allOrders, lastSixMonthOrders, categories, femaleUsersCount, latestTransactions,] = await Promise.all([
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
            User.countDocuments({ gender: "female" }),
            latestTransactionsPromise,
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
            const monthDiff = (today.getMonth() - orderCreation.getMonth() + 12) % 12;
            if (monthDiff < 6) {
                orderMonthlyCount[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        });
        // Fetch Category and its count in stock
        const categoryCount = await getInventories({
            categories,
            productsCount,
        });
        // Users count
        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount,
        };
        // Latest Transactions
        const modifyLatestTransactions = latestTransactions.map((i) => ({
            _id: i._id,
            discount: i.discount,
            total: i.total,
            status: i.status,
            quantity: i.orderItems.length,
        }));
        // Store calculated stats in the `stats` variable
        stats = {
            categoryCount,
            changePercent,
            count,
            chart: { order: orderMonthlyCount, revenue: orderMonthlyRevenue },
            userRatio,
            latestTransactions: modifyLatestTransactions,
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
export const getPieCharts = TryCatch(async (req, res, next) => {
    const key = "admin-pie-chart";
    let charts = {};
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key));
    }
    else {
        const allOrdersPromise = Order.find({}).select([
            "subtotal",
            "tax",
            "shippingCharges",
            "discount",
            "total",
        ]);
        const [ProcessingOrders, ShippedOrders, DeliveredOrders, categories, productsCount, outStock, allOrders, allUsers, adminUsers, customerUsers,] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            allOrdersPromise,
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "user" }),
        ]);
        // Processing, Shipped and Devlivered order count
        const orderFullfillment = {
            ProcessingOrders,
            ShippedOrders,
            DeliveredOrders,
        };
        // Product Categories name and count
        const productCategories = await getInventories({
            categories,
            productsCount,
        });
        // In Stock and Out Stock Information
        const stockAvailability = {
            inStock: productsCount - outStock,
            outStock,
        };
        // Revenue Distribution:- Net Marin, Discount, Production Cost, Burnt (Wastage), Marketing Cost
        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;
        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };
        // Count users based on age:- teen, adult, old
        const usersAgeGroup = {
            teen: allUsers.filter((i) => Number(i.age) < 20).length,
            adult: allUsers.filter((i) => Number(i.age) >= 20 && Number(i.age) < 40)
                .length,
            old: allUsers.filter((i) => Number(i.age) >= 40).length,
        };
        // Count users based on role:- admin, customer
        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers,
        };
        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer,
        };
        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        data: charts,
    });
});
export const getBarCharts = TryCatch(async (req, res, next) => {
    let charts = {};
    const key = "admin-bar-chart";
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key));
    }
    else {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const twelweMonthsAgo = new Date();
        twelweMonthsAgo.setMonth(twelweMonthsAgo.getMonth() - 6);
        const sixMonthsProductsPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const sixMonthsUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const twelweMonthsOrdersPromise = Order.find({
            createdAt: {
                $gte: twelweMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const [sixMonthsProducts, sixMonthsUsers, twelweMonthsOrders] = await Promise.all([
            sixMonthsProductsPromise,
            sixMonthsUsersPromise,
            twelweMonthsOrdersPromise,
        ]);
        const products = getCharData({ length: 6, today, docArr: sixMonthsProducts });
        const users = getCharData({ length: 6, today, docArr: sixMonthsUsers });
        const orders = getCharData({ length: 12, today, docArr: twelweMonthsOrders });
        charts = {
            products,
            users,
            orders,
        };
        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        data: charts,
    });
});
export const getLineCharts = TryCatch(async (req, res, next) => { });

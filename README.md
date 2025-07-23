# 🛍️ MERN E-Commerce Platform — Backend

A robust and scalable backend for a full-stack e-commerce application built with **Node.js**, **Express.js**, **MongoDB**, and **TypeScript**, featuring integrations with **Stripe**, **Firebase**, **Cloudinary**, **Redis**, and **Docker**.

---

## 🚀 Features

### 🧑‍💼 Admin APIs

* 📦 **Product Management** — CRUD operations for products with media upload.
* 📊 **Sales Dashboard** — Real-time metrics and charts powered by Redis.
* 🎟️ **Coupon System** — Create and apply discounts via codes.
* 🧾 **Order Processing** — Full order lifecycle support.
* 👥 **User Management** — Role-based access and user controls.

### 🧑‍🤝‍🧑 Customer APIs

* 🔐 **Authentication** — Firebase token verification and middleware.
* 💳 **Payments** — Stripe checkout integration with secure webhooks.
* 🛒 **Cart & Checkout** — API for cart items, address, shipping, and placing orders.
* ⭐ **Reviews** — Add and manage product reviews.

---

## ⚙️ Tech Stack

| Layer     | Technologies       |
| --------- | ------------------ |
| Runtime   | Node.js            |
| Framework | Express.js         |
| Database  | MongoDB + Mongoose |
| Caching   | Redis              |
| Auth      | Firebase Admin SDK |
| Payments  | Stripe             |
| Storage   | Cloudinary         |
| Container | Docker             |

---

## 📁 Project Structure

```
src/
├── controllers/       # Business logic for each route group
├── middlewares/       # Auth, error handlers, file uploads
├── models/            # Mongoose schemas
├── routes/            # API routes (product, order, user...)
├── utils/             # Common utilities and helpers
├── types/             # TypeScript interfaces
├── app.ts             # Express app instance
```

---

## 🧪 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/danishali22/mern-ecommerence-backend.git
cd mern-ecommerence-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.sample` to `.env` and provide:

```env
PORT=5000
MONGODB_URI=your_mongo_uri
FIREBASE_PROJECT_ID=your_project
STRIPE_SECRET_KEY=your_stripe_secret
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
REDIS_URL=redis://localhost:6379
```

### 4. Start Server

```bash
npm run dev
```

---

## 🐳 Docker Support

### Build Docker Image

```bash
docker build -t mern-ecommerce-backend .
```

### Run in Container

```bash
docker run -p 5000:5000 mern-ecommerce-backend
```

---

## 📚 Learnings

* Used **Firebase Admin SDK** to verify client tokens and protect routes.
* Implemented robust **Stripe webhook** handler for real-time payment events.
* Applied **Redis caching** for analytics and dashboard metrics.
* Modularized routes, controllers, and services for maintainability.
* Scaled backend using **Docker** and `.env`-based config system.

---

## 🔗 Related

* Frontend: [mern-ecommerence-frontend](https://github.com/danishali22/mern-ecommerence-frontend)

---

## 💬 Contact

> Built by [@danishali22](https://github.com/danishali22) — feel free to connect!

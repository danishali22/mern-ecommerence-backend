# DanishAli22 MERN E-Commerce Backend

Welcome to the **DanishAli22 MERN E-Commerce Backend**! This is the backend for an e-commerce platform built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and **TypeScript**. It provides secure user authentication, product management, order processing, and payment handling, all built to be scalable and performant.

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Directory Structure](#directory-structure)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This project is designed to handle the backend logic of an e-commerce platform. It includes features such as:
- **User authentication** using Firebase.
- **Product management** (CRUD operations).
- **Order processing** and payment integration with Stripe.
- **Coupon management** for promotional discounts.
- **Admin dashboard** for managing the platform and viewing analytics.
- **Redis caching** for improved performance.

---

## Tech Stack

- **Node.js** – Backend runtime.
- **Express.js** – Web framework for routing and API handling.
- **MongoDB** – NoSQL database for storing product, order, and user data.
- **TypeScript** – Ensures type safety and better maintainability.
- **Stripe** – Secure payment gateway integration.
- **Firebase** – Authentication service for Google login.
- **Docker** – Containerized environment for ease of deployment.
- **Redis** – Caching to speed up requests and reduce database load.
- **Cloudinary** – Image management for product images.

---

## Installation

### Prerequisites

Make sure you have the following installed:
- **Node.js** (version >= 14)
- **Docker** (optional, for containerized environment)
- **MongoDB** (locally or remotely)

### Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/danishali22-mern-ecommerce-backend.git
    cd danishali22-mern-ecommerce-backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Copy the sample environment file and configure your environment variables:

    ```bash
    cp .env.sample .env
    ```

    Update the `.env` file with your **MongoDB URI**, **Stripe API keys**, **Firebase credentials**, and other environment variables.

4. Run the application:

    - For development:

      ```bash
      npm run dev
      ```

    - For production:

      ```bash
      npm start
      ```

    Alternatively, you can use Docker to run the application:

    - Build and run the Docker container:

      ```bash
      docker-compose up --build
      ```

---

## Directory Structure

```plaintext
└── danishali22-mern-ecommerence-backend/
    ├── Dockerfile                  # Production Dockerfile
    ├── Dockerfile.dev              # Development Dockerfile
    ├── package.json                # Project dependencies and scripts
    ├── tsconfig.json               # TypeScript configuration
    ├── vercel.json                 # Vercel configuration for deployment
    ├── .dockerignore               # Files to be excluded from Docker build
    ├── .env.sample                 # Sample environment variables
    ├── public/
    │   └── index.ts                # Entry point for public-facing API
    └── src/
        ├── app.ts                  # Main app entry point
        ├── controllers/            # API logic for handling requests
        │   ├── coupon.ts
        │   ├── dashboard.ts
        │   ├── order.ts
        │   ├── payment.ts
        │   ├── product.ts
        │   └── user.ts
        ├── middlewares/            # Middleware functions for authentication, error handling, etc.
        │   ├── auth.ts
        │   ├── error.ts
        │   └── multer.ts
        ├── models/                 # MongoDB models (schemas)
        │   ├── coupon.ts
        │   ├── order.ts
        │   ├── product.ts
        │   ├── review.ts
        │   └── user.ts
        ├── routes/                 # Express routes
        │   ├── coupon.ts
        │   ├── dashboard.ts
        │   ├── order.ts
        │   ├── payment.ts
        │   ├── product.ts
        │   └── user.ts
        ├── types/                  # TypeScript types for type safety
        │   └── types.ts
        └── utils/                  # Utility functions
            ├── features.ts
            └── utility-class.ts

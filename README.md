# Subscription Tracker API

A production-minded backend API for managing personal subscriptions, authentication, and protected user data.

Built with `Node.js`, `Express`, `MongoDB`, `Mongoose`, `JWT`, and `Arcjet`, this project focuses on clean API structure, authentication flow, database modeling, and security-first middleware.

## Overview

Subscription Tracker is designed to help users manage recurring services like Netflix, Spotify, gym memberships, SaaS plans, and other paid subscriptions from a single backend system.

This project demonstrates:

- REST API design with route-controller-model separation
- JWT-based authentication and protected routes
- MongoDB schema design with validation rules
- Rate limiting and bot protection using Arcjet
- Error handling middleware for cleaner API responses
- Environment-based configuration for local and production setups

## Tech Stack

- `Node.js`
- `Express.js`
- `MongoDB Atlas`
- `Mongoose`
- `JWT`
- `bcryptjs`
- `Arcjet`
- `dotenv`
- `nodemon`

## Features

### Implemented

- User sign up with password hashing
- User sign in with JWT token generation
- Protected route access using bearer tokens
- Create subscription endpoint
- Fetch subscriptions for a specific authenticated user
- Fetch all users
- Fetch a single protected user by id
- Global error handling middleware
- Arcjet middleware for rate limiting, bot detection, and request protection

### In Progress

- Sign out flow
- Update subscription
- Delete subscription
- Cancel subscription
- Upcoming renewals endpoint
- Full CRUD for users

## Project Structure

```bash
Subscription_Tracker/
├── config/
│   ├── arcjet.js
│   └── env.js
├── controllers/
│   ├── auth.controller.js
│   ├── subscription.controller.js
│   └── user.controller.js
├── database/
│   └── mongodb.js
├── middlewares/
│   ├── arcjet.middleware.js
│   ├── auth.middleware.js
│   └── error.middleware.js
├── models/
│   ├── subscription.model.js
│   └── user.model.js
├── routes/
│   ├── auth.routes.js
│   ├── subscription.routes.js
│   └── user.routes.js
├── scripts/
│   └── auto-commit.mjs
├── app.js
├── package.json
└── README.md
```

## API Endpoints

### Auth

- `POST /api/v1/auth/sign-up`
- `POST /api/v1/auth/sign-in`
- `POST /api/v1/auth/sign-out`

### Users

- `GET /api/v1/users`
- `GET /api/v1/users/:id`

### Subscriptions

- `POST /api/v1/subscriptions`
- `GET /api/v1/subscriptions/user/:id`
- `GET /api/v1/subscriptions`
- `GET /api/v1/subscriptions/:id`
- `PUT /api/v1/subscriptions/:id`
- `DELETE /api/v1/subscriptions/:id`
- `PUT /api/v1/subscriptions/:id/cancel`
- `GET /api/v1/subscriptions/upcoming-renewals`

Note: some subscription and user routes are scaffolded and still under implementation.

## Environment Variables

Create a file named `.env.development.local` and add:

```env
PORT=5500
NODE_ENV=development
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
ARCJET_API_KEY=your_arcjet_api_key
ARCJET_ENV=development
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/adisri19/Subscription_Tracker.git
cd Subscription_Tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.development.local` using the example above.

### 4. Start the development server

```bash
npm run dev
```

If everything is configured correctly, the terminal should show:

```bash
MongoDB connected: <database_name>
Subscription Tracker API is running on http://localhost:5500
```

## Example Request

### Sign Up

`POST /api/v1/auth/sign-up`

```json
{
  "name": "Aditya",
  "email": "aditya@example.com",
  "password": "123123"
}
```

### Create Subscription

`POST /api/v1/subscriptions`

Headers:

```text
Authorization: Bearer <your_token>
Content-Type: application/json
```

Body:

```json
{
  "name": "Netflix",
  "price": 499,
  "currency": "INR",
  "duration": "Monthly",
  "category": "Premium",
  "paymentmethod": "UPI",
  "status": "Active",
  "startdate": "2026-04-30T00:00:00.000Z",
  "renewaldate": "2026-05-30T00:00:00.000Z",
  "userID": "your_user_id"
}
```

## Security Highlights

- Passwords are hashed with `bcryptjs`
- JWT protects private routes
- Arcjet adds bot detection and rate limiting
- Validation is enforced at the Mongoose schema level
- Centralized error middleware keeps responses consistent

## What Makes This Project Strong

This project is more than a CRUD demo. It shows a practical backend architecture with authentication, security middleware, schema validation, and route protection. It reflects an understanding of how real backend systems are structured and secured.

## Future Improvements

- Refresh token flow
- Role-based authorization
- Subscription renewal reminders
- Email notifications
- Dashboard analytics
- Automated tests
- Docker support
- API documentation with Swagger or Postman collection export

## Author

**Aditya Srivastava**

If you liked this project or want to collaborate, feel free to connect through GitHub.

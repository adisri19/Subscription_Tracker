# 🔔 SubDub — Subscription Tracker API

A production-ready REST API for tracking personal subscriptions with automated renewal reminders.

## ✨ Features

- **JWT Authentication** — Secure sign-up, sign-in, sign-out with token blacklisting
- **Full CRUD** for subscriptions with ownership enforcement
- **Automated Email Reminders** — Scheduled via Upstash Workflow at 7, 5, 2, and 1 day before renewal
- **Spending Analytics** — Monthly spend estimates, category breakdowns, trend analysis via MongoDB aggregation pipelines
- **Role-Based Access Control** — User and Admin roles (`authorizeAdmin`)
- **Rate Limiting & Bot Protection** — Via Arcjet security shield and token bucket algorithms
- **Input Validation** — Strict Zod schema validation on input endpoints
- **Paginated Responses** — Standardized pagination metadata on all list endpoints
- **Swagger API Docs** — Interactive OpenAPI 3.0 documentation at `/api-docs`
- **Dockerized** — One-command setup using Docker and Docker Compose

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ (ESM) |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Email | Nodemailer |
| Scheduling | Upstash Workflow |
| Security | Arcjet |
| Testing | Jest + Supertest + MongoMemoryServer |
| Docs | Swagger UI (swagger-jsdoc) |
| Containers | Docker + Docker Compose |

## 🚀 Quick Start

### With Docker
```bash
git clone <repo-url>
cd subscription-tracker
cp .env.example .env  # Fill in values
docker-compose up
```

### Without Docker
```bash
npm install
cp .env.example .env
npm run dev
```

The server will be running at `http://localhost:3000`.

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/sign-up` | ❌ | Register new account |
| POST | `/api/v1/auth/sign-in` | ❌ | Login and obtain JWT |
| POST | `/api/v1/auth/sign-out` | ✅ | Logout and blacklist active JWT |
| GET | `/api/v1/subscriptions/upcoming-renewals` | ✅ | Next renewals within day window |
| GET | `/api/v1/subscriptions/analytics/summary` | ✅ | Spend summary & breakdown |
| GET | `/api/v1/subscriptions/analytics/monthly-trend` | ✅ | Monthly spend over time |
| GET | `/api/v1/subscriptions/user/:id` | ✅ | Paginated user's subscriptions |
| GET | `/api/v1/subscriptions` | ✅ (Admin) | Paginated list of all subscriptions |
| POST | `/api/v1/subscriptions` | ✅ | Create new subscription |
| GET | `/api/v1/subscriptions/:id` | ✅ | Get subscription by ID |
| PUT | `/api/v1/subscriptions/:id` | ✅ | Update subscription fields |
| DELETE | `/api/v1/subscriptions/:id` | ✅ | Delete subscription (204 No Content) |
| PUT | `/api/v1/subscriptions/:id/cancel` | ✅ | Cancel subscription (sets renewalDate to null) |

Full interactive Swagger docs available at: `http://localhost:3000/api-docs`

## ⚙️ Environment Variables

See [`.env.example`](.env.example) for all required variables and descriptions.

## 🧪 Running Tests

```bash
npm test           # Run all unit and integration test suites
npm run test:watch # Watch mode
npm run test:coverage # Coverage report
```

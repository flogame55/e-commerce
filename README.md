# 🛍️ Full-Stack E-Commerce Platform

A production-style e-commerce web application built with **Express.js**, **SQLite**, and **vanilla JavaScript**. The project demonstrates clean layered architecture, secure authentication, and a microservice-ready checkout pipeline.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-F7DF1E?logo=jsonwebtokens&logoColor=black)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Frontend Pages](#-frontend-pages)
- [Security Considerations](#-security-considerations)
- [Future Improvements](#-future-improvements)

---

## ✨ Features

| Area | Details |
|------|---------|
| **Authentication** | Register & login with bcrypt password hashing + JWT tokens |
| **Authorization** | JWT middleware protects checkout; token-based identity verification |
| **Product Catalog** | Dynamic product listing, category filtering, single product view |
| **Shopping Cart** | Client-side cart with localStorage persistence across pages |
| **Checkout** | JWT-protected, bulk price verification, microservice-ready |
| **Database** | SQLite with auto-migration (`CREATE TABLE IF NOT EXISTS`) |
| **Error Handling** | Centralized middleware distinguishing operational vs. unexpected errors |
| **Security** | Input validation, rate limiting, anti-enumeration, stock guards |
| **Portability** | **Zero Config Architecture** — internal URLs dynamically adjust to the server port |

---

## 🏗️ Architecture

The backend follows a **layered architecture** pattern, separating concerns across four distinct layers:

```
Client Request
     │
     ▼
┌─────────────────────────────────────────────────┐
│                   Routes Layer                  │
│  Defines URL patterns & HTTP methods            │
│  (routes/auth.js, routes/products.js, ...)      │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│               Controllers Layer                 │
│  Extracts request data, delegates to services,  │
│  sends HTTP responses                           │
│  (controllers/authController.js, ...)           │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│                Services Layer                   │
│  Core business logic: validation, hashing,      │
│  JWT signing, inter-service HTTP verification   │
│  (services/authService.js, ...)                 │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              Repositories Layer                 │
│  Raw SQL queries against SQLite database.       │
│  Single source of truth for data access.        │
│  (repositories/userRepository.js, ...)          │
└─────────────────────────────────────────────────┘
```

### Microservice-Ready Checkout Flow

The checkout service does **not** import other services directly. Instead, it verifies users and product prices via HTTP calls to internal endpoints. 

**Optimization: Bulk Verification**  
Instead of looping through items, the checkout service makes a single **bulk request** to the catalog, reducing network overhead and preventing N+1 connection issues.

```
Checkout Request ──► JWT Auth ──► Validate Input ──► Verify User (HTTP) ──► Bulk Price Check (HTTP) ──► Check Stock ──► Save Order (DB)
                     Middleware    Service Layer       User Service           Catalog Service (1 call)    Repository
```

---

## 📂 Project Structure

```
e-commerce/
├── backend/                    # Express.js API Server
│   ├── config/
│   │   └── database.js         # SQLite connection & table auto-migration
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Verify handlers
│   │   ├── checkoutController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT token verification & req.user injection
│   │   ├── rateLimiter.js      # Rate limiting for auth endpoints
│   │   └── errorHandler.js     # Centralized error handling
│   ├── repositories/
│   │   ├── orderRepository.js  # Order SQL queries (transactional)
│   │   ├── productRepository.js # Product queries + stock guard
│   │   └── userRepository.js
│   ├── routes/
│   │   ├── auth.js             # /api/register, /api/login (rate-limited)
│   │   ├── checkout.js         # /api/checkout (JWT-protected)
│   │   └── products.js         # /api/products, /api/products/filter, /api/products/:id
│   ├── services/
│   │   ├── authService.js      # Auth logic (bcrypt + JWT + input validation)
│   │   ├── checkoutService.js  # Checkout orchestration with HTTP verification
│   │   └── productService.js   # Product query logic
│   ├── scripts/
│   │   ├── init_db.js          # Database initialization script
│   │   ├── integration_test.js # Integration test suite
│   │   └── verify_security.js  # Security verification script
│   ├── data/
│   │   └── products.json       # Seed data for product catalog
│   ├── .env                    # 🔒 Local secrets (git-ignored)
│   ├── .env.example            # 📋 Template for required env vars (committed)
│   ├── server.js               # Application entry point
│   ├── seed.js                 # Database seeder
│   ├── syncProducts.js         # Product sync utility
│   ├── import_products.js      # Product import utility
│   └── package.json            # Dependencies & npm scripts
│
├── css/                        # Stylesheets (Bootstrap, custom, vendor)
│   └── style.css               # Main compiled stylesheet
├── scss/                       # SCSS source files
│   └── style.scss
├── js/                         # Frontend JavaScript
│   ├── main.js                 # Core frontend logic
│   ├── cart-service.js         # Cart state management (localStorage)
│   ├── cart-page.js            # Cart page rendering
│   └── product-service.js      # Product fetching & caching
├── images/                     # Product & UI images
├── fonts/                      # Custom icon fonts
├── Documentation/              # Architecture diagrams & documentation
│
├── index.html                  # Homepage
├── shop.html                   # Product listing
├── catalog.html                # Category catalog
├── product-single.html         # Product detail page
├── cart.html                   # Shopping cart
├── checkout.html               # Checkout flow
├── login.html                  # User login
├── register.html               # User registration
├── about.html                  # About page
├── blog.html                   # Blog listing
├── blog-single.html            # Blog post detail
├── contact.html                # Contact form
├── wishlist.html               # Wishlist page
├── .gitignore                  # Git ignore rules
└── README.md                   # ← You are here
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Express.js 5** | Web framework & REST API |
| **SQLite 3** | Embedded relational database |
| **bcrypt** | Password hashing (salted, 10 rounds) |
| **jsonwebtoken** | JWT authentication & route protection |
| **express-rate-limit** | Brute-force protection on auth endpoints |
| **dotenv** | Environment variable management |
| **cors** | Configurable Cross-Origin Resource Sharing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5 / CSS3 / JavaScript** | Core web technologies |
| **Bootstrap 4** | Responsive grid & components |
| **jQuery** | DOM manipulation & AJAX |
| **SCSS** | Preprocessed stylesheets |
| **Owl Carousel** | Product carousels |
| **AOS** | Scroll-based animations |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/e-commerce.git
cd e-commerce

# 2. Install backend dependencies
cd backend
npm install

# 3. Set up environment variables
cp .env.example .env
# Then edit .env and replace CHANGE_ME_GENERATE_A_STRONG_SECRET with a real key:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# 4. Seed the product database (optional)
npm run seed

# 5. Start the server
npm start
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Start** | `npm start` | Launch the Express server |
| **Seed** | `npm run seed` | Populate database with product data |
| **Init DB** | `npm run init-db` | Run database initialization script |
| **Test** | `npm test` | Run integration test suite |

### Verify It Works

```bash
# Server should output:
# Connected to the Architecture of Trust (SQLite DB).
# Users table is verified and ready.
# Orders table is verified and ready.
# Server running on http://localhost:3000

# Test the API
curl http://localhost:3000/api/products
```

> [!NOTE]
> The SQLite database file (`database.db`) is **auto-created** on first run.
> Tables are created via `CREATE TABLE IF NOT EXISTS` — no manual migration step needed.

Open [http://localhost:3000](http://localhost:3000) in your browser to see the storefront.

---

## 🔐 Environment Variables

All secrets and configuration are managed via a `.env` file using the [dotenv](https://github.com/motdotla/dotenv) library.

### How It Works

1. **`dotenv`** is loaded at the very top of `server.js` with an explicit path:
   ```js
   const path = require('path');
   require('dotenv').config({ path: path.join(__dirname, '.env') });
   ```
2. Using `__dirname` ensures the `.env` file is found regardless of where you run the command from (project root, backend folder, CI pipeline, etc.).
3. This reads `backend/.env` and injects every `KEY=VALUE` pair into `process.env`.
4. Application code accesses values via `process.env.KEY_NAME`.
5. A pre-flight check in `server.js` crashes the server immediately if `JWT_SECRET` is missing — preventing the app from running in an insecure state.

### Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server listening port (default: `3000`) |
| `JWT_SECRET` | **Yes** | Secret key for signing JWT tokens. |
| `DATABASE_URL` | No | Path to the SQLite database file |
| `USER_SERVICE_URL` | No | Internal URL for user verification. **(Auto-calculates if empty)** |
| `CATALOG_SERVICE_URL` | No | Internal URL for product catalog. **(Auto-calculates if empty)** |
| `MAX_CART_ITEMS` | No | Maximum allowed items in a single order (default: `100`) |
| `ALLOWED_ORIGIN` | No | CORS allowed origin for production |
| `NODE_ENV` | No | `development` or `production` |

### 🌟 Zero Config Architecture
The backend is designed for maximum portability. If `USER_SERVICE_URL` or `CATALOG_SERVICE_URL` are not provided in your `.env`, the app automatically constructs them using the current `PORT`. 

**Example:** If you change your `PORT` to `5000`, the internal services will automatically start looking for each other at `http://localhost:5000` without any manual configuration.

### Security Rules

- ✅ **`.env`** is in `.gitignore` — never committed to version control
- ✅ **`.env.example`** is committed — shows required keys without real values
- ✅ **Pre-flight check** — server refuses to start without `JWT_SECRET`
- ✅ **Fallback defaults** — non-secret values have safe defaults in code

> **Generate a secure JWT_SECRET:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
> ```

---

## 📡 API Endpoints

### Authentication (Rate-Limited: 10 requests / 15 min)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/register` | Create a new user account | ❌ |
| `POST` | `/api/login` | Authenticate and receive JWT | ❌ |
| `GET` | `/api/verify/:id` | Verify user exists (internal) | ❌ |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/products` | Retrieve all products | ❌ |
| `GET` | `/api/products/filter?category=X` | Filter products by category | ❌ |
| `GET` | `/api/products/:id` | Get single product by ID | ❌ |

### Checkout (JWT-Protected)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/checkout` | Process an order | ✅ Bearer Token |

#### Checkout Request

```bash
# Header required:
Authorization: Bearer <jwt_token>
```

```json
{
  "cartItems": [
    { "id": 3, "quantity": 2 },
    { "id": 7, "quantity": 1 }
  ]
}
```

> **Note:** `user_id` is no longer sent in the body — it is extracted from the verified JWT token by the auth middleware.

---

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name    TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    reg_date      TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    product_id  INTEGER NOT NULL,
    quantity    INTEGER NOT NULL,
    total_price REAL NOT NULL,
    order_date  TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

---

## 🖥️ Frontend Pages

| Page | File | Description |
|------|------|-------------|
| Homepage | `index.html` | Hero section, featured products, categories |
| Shop | `shop.html` | Full product listing with grid layout |
| Catalog | `catalog.html` | Category-based product browsing |
| Product Detail | `product-single.html` | Individual product with description |
| Cart | `cart.html` | View & manage cart items |
| Checkout | `checkout.html` | Complete purchase flow |
| Login | `login.html` | User authentication |
| Register | `register.html` | New account creation |
| About | `about.html` | Brand story & team |
| Blog | `blog.html` | Blog article listing |
| Blog Post | `blog-single.html` | Individual blog article |
| Contact | `contact.html` | Contact form |
| Wishlist | `wishlist.html` | Saved products |

---

## 🔒 Security Considerations

| Practice | Implementation |
|----------|----------------|
| **Password Hashing** | bcrypt with 10 salt rounds — plaintext passwords are never stored |
| **JWT Route Protection** | Checkout endpoint requires valid `Bearer` token; user identity from token, not request body |
| **Rate Limiting** | Login & register limited to 10 requests per 15 min per IP via `express-rate-limit` |
| **Anti-Enumeration** | Login returns identical error (`"Invalid email or password"`) for both wrong email and wrong password |
| **Input Validation** | Email regex, password min length, `Array.isArray` cart check, integer type checks on item id/quantity |
| **Stock Guard** | `UPDATE ... WHERE stock >= ?` prevents negative inventory at the SQL level |
| **JSON Body Limit** | `express.json({ limit: '10kb' })` prevents oversized payload DoS attacks |
| **SQL Injection Prevention** | All queries use parameterized statements (`?` placeholders) |
| **Server-Side Price Verification** | Checkout re-fetches product prices from catalog, preventing client-side price tampering |
| **Pre-Flight Security Check** | Server exits immediately if `JWT_SECRET` is undefined |
| **Centralized Error Handling** | Operational errors return safe messages; unexpected errors never leak stack traces |
| **Environment Isolation** | Secrets stored in `.env` (git-ignored), template in `.env.example` (committed) |
| **CORS Configuration** | Open in development, restricted to `ALLOWED_ORIGIN` in production |
| **Relative API URLs** | Frontend uses `/api/...` paths — no hardcoded `localhost` references |
| **Portable Config** | `dotenv` uses `__dirname`-based path — app works from any working directory |

---

## 🗺️ Future Improvements

- [x] ~~Add JWT middleware to protect checkout and user-specific routes~~
- [x] ~~Add rate limiting to auth endpoints~~
- [x] ~~Input validation and anti-enumeration on login~~
- [x] ~~Stock guard to prevent negative inventory~~
- [ ] Implement order history page (per-user)
- [ ] Add product search with full-text indexing
- [ ] Implement pagination for product listings
- [ ] Set up automated testing with Jest
- [ ] Containerize with Docker for deployment
- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement refresh tokens for extended sessions
- [ ] Add Helmet.js for HTTP security headers

---

## 📝 License

This project is licensed under the ISC License.

---

<p align="center">
  Built with ❤️ as a portfolio project demonstrating full-stack development skills.
</p>

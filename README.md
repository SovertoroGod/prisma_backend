# ORM Backend — POS API

A **Point of Sale (POS) backend API** for multi-branch retail businesses. Handles sales transactions, inventory management across branches, customer debt tracking, role-based user management, and notifications — all powered by **Node.js**, **Express 5**, **Prisma ORM**, and **MySQL**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 |
| Framework | Express 5 |
| ORM | Prisma 6 |
| Database | MySQL |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| Security | helmet, cors, connect-timeout |
| Logging | morgan |
| Dev | nodemon |
| Containerization | Docker & Docker Compose |

---

## Features

- **Multi-branch management** — create, update, activate/deactivate branches
- **Hierarchical product catalog** — Categories → Product Lists → Product Items → Product Units (per branch)
- **Sales vouchers** — create transactions with items, discounts, multiple payment types (cash, transfer)
- **Stock transfers** — two-phase transfer between branches (deduct on source, confirm on destination)
- **Inventory logging** — full audit trail of stock changes (transfer, sale, issue, adjustment, return)
- **Customer debt tracking** — track debts with partial repayments and status management
- **Notifications** — DB-based notifications for stock transfer events
- **Role-based access control** — Admin, Manager, Cashier roles with granular permissions
- **Bank account management** — track transfers and repayments via bank accounts

---

## Architecture

```
Request
  │
  ▼
Routes (app/routes/)
  │
  ▼
Middlewares: verifyToken → authorize → validationErrorHandler
  │
  ▼
Controllers (app/controllers/) — HTTP concerns (parse, respond)
  │
  ▼
Services (app/services/) — Business logic
  │
  ▼
Prisma ORM → MySQL
```

Routes are auto-loaded from `app/routes/` — any `.js` file added there is mounted under `/api`.

---

## Prerequisites

- Node.js 22+
- MySQL 8+
- Docker & Docker Compose (optional, for containerized setup)

---

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url>
cd orm_backend
npm install
```

### 2. Environment variables

Copy the `.env` template and adjust values:

```env
DATABASE_URL="mysql://root:root@localhost:3306/pos_prisma"
PORT=4000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
REQUEST_TIMEOUT=15s
```

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the server

```bash
npm run dev    # development (with nodemon)
# or
npm start      # production
```

The API will be available at `http://localhost:4000`.

### Docker (alternative)

```bash
docker compose up -d
```

> The container reads `.env` and connects to MySQL via `host.docker.internal:3306` by default.

---

## Project Structure

```
orm_backend/
├── app/
│   ├── controllers/         # HTTP request handlers
│   ├── middlewares/          # verifyToken, authorize, validationErrorHandler
│   ├── routes/              # Express route definitions (auto-loaded)
│   ├── services/            # Business logic layer
│   └── validations/         # express-validator rules
│       └── common/          # Reusable validators (requiredString, optionalInt, etc.)
├── migrations/              # Custom data migration scripts
├── prisma/
│   └── schema.prisma        # Database schema
├── .env                     # Environment variables
├── docker-compose.yml       # Docker Compose config
├── Dockerfile               # Docker build
├── prismaClient.js          # Singleton Prisma client instance
├── server.js                # Application entry point
└── package.json
```

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Authentication

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/register` | Public | Register new user |

### Branches

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/admin/branches` | Admin | Create branch |
| GET | `/admin/branches` | Admin | List all branches |
| GET | `/admin/branches/:id` | Admin | Get branch by ID |
| PUT | `/admin/branches/:id` | Admin | Update branch |
| DELETE | `/admin/branches/:id` | Admin | Soft-delete branch |
| GET | `/branches` | Authenticated | List active branches |

### Categories

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/admin/categories` | Admin | Create category |
| GET | `/admin/categories` | Admin | List all categories |
| GET | `/admin/categories/:id` | Admin | Get category by ID |
| PUT | `/admin/categories/:id` | Admin | Update category |
| DELETE | `/admin/categories/:id` | Admin | Soft-delete category |
| GET | `/categories` | Authenticated | List active categories |

### Products

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/admin/product-lists` | Admin | Create product list |
| GET | `/admin/product-lists` | Admin | List all product lists |
| GET | `/admin/product-lists/:id` | Admin | Get product list by ID |
| PUT | `/admin/product-lists/:id` | Admin | Update product list |
| DELETE | `/admin/product-lists/:id` | Admin | Soft-delete product list |
| POST | `/admin/product-items` | Admin | Create product item |
| GET | `/admin/product-items` | Admin | List all product items |
| GET | `/admin/product-items/:id` | Admin | Get product item by ID |
| PUT | `/admin/product-items/:id` | Admin | Update product item |
| DELETE | `/admin/product-items/:id` | Admin | Soft-delete product item |
| GET | `/product-items` | Authenticated | List active product items |

### Product Units (Inventory per branch)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/admin/product-units` | Admin | Create product unit |
| GET | `/admin/product-units` | Admin | List product units |
| GET | `/admin/product-units/:id` | Admin | Get product unit by ID |
| PUT | `/admin/product-units/:id` | Admin | Update product unit |
| DELETE | `/admin/product-units/:id` | Admin | Soft-delete product unit |
| GET | `/product-units/logs` | Authenticated | View inventory logs |

### Stock Transfers

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/stock-transfers` | Admin / Source Manager | Initiate transfer |
| GET | `/admin/stock-transfers` | Admin | List all transfers |
| GET | `/admin/stock-transfers/:id` | Admin | Get transfer by ID |
| GET | `/manager/stock-transfers` | Manager | List transfers for manager's branch |

### Vouchers (Sales)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/admin/vouchers` | Admin | Create voucher |
| GET | `/admin/vouchers` | Admin | List all vouchers |
| GET | `/admin/vouchers/:id` | Admin | Get voucher by ID |
| GET | `/vouchers` | Cashier | List cashier's vouchers |
| POST | `/vouchers` | Cashier | Create voucher (cashier) |
| PATCH | `/vouchers/:id/cancel` | Cashier | Cancel voucher |

### Customers

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/admin/customers` | Admin | Create customer |
| GET | `/admin/customers` | Admin | List all customers |
| GET | `/admin/customers/:id` | Admin | Get customer by ID |
| PUT | `/admin/customers/:id` | Admin | Update customer |
| DELETE | `/admin/customers/:id` | Admin | Delete customer |
| GET | `/customers` | Authenticated | List customers |

### Debts

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/admin/debts` | Admin | Create debt |
| GET | `/admin/debts` | Admin | List all debts |
| PATCH | `/admin/debts/:id` | Admin | Update debt |
| GET | `/debts` | Authenticated | List debts |

### Bank Accounts

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/admin/bank-accounts` | Admin | Create bank account |
| GET | `/admin/bank-accounts` | Admin | List all bank accounts |
| PATCH | `/admin/bank-accounts/:id` | Admin | Update bank account |
| GET | `/bank-accounts` | Authenticated | List active bank accounts |

### Notifications

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/notifications` | Authenticated | Get my notifications |
| PATCH | `/notifications/:id/read` | Authenticated | Mark one as read |
| PATCH | `/notifications/read-all` | Authenticated | Mark all as read |

### Dashboard

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard analytics |

### User Management

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/admin/users` | Admin | Create user |
| GET | `/admin/users` | Admin | List all users |
| PATCH | `/admin/users/:id` | Admin | Update user |

---

## Authentication

The API uses **JWT Bearer token** authentication.

1. Login via `POST /api/auth/login` to receive a token.
2. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

### Roles

| Role | Permissions |
|------|------------|
| **admin** | Full access to all admin endpoints |
| **manager** | Branch-level management, can initiate stock transfers from own branch |
| **cashier** | Create & cancel vouchers, view limited data |

---

## Database Schema

The schema defines 14 models:

- **User** — authentication & role-based access, linked to Branch
- **Branch** — physical store locations
- **Category** — hierarchical product categories (self-referencing parent/child)
- **ProductList** — product groups under a category
- **ProductItem** — SKU-level products with pricing
- **ProductUnit** — branch-level inventory (quantity per product per branch)
- **ProductUnitLog** — audit trail for all inventory changes
- **StockTransfer** — two-phase transfers between branches
- **Voucher / VoucherItem** — sales transactions with line items
- **Customer** — customer profiles
- **Debt / Repayment** — debt tracking with partial payments
- **BankAccount** — bank accounts for cashless transactions
- **Notification** — in-app notifications
- **IssueItem** — stock issue records

---

## License

ISC

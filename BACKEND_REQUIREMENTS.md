# Spring Boot Backend Requirements

This document captures backend requirements inferred from the current frontend implementation.

## Frontend Reality Check

- The current project is **React + Vite + TypeScript**, not Vue.
- All business data is currently in-memory (products, users, orders, cart state).
- Backend work should replace mock/local state with API calls while keeping the same UX and routes.

## Business Scope

The backend must support an e-commerce flow for construction materials:

- User registration and login (customer and admin roles)
- Product catalog browsing and product details
- Cart and checkout order creation
- Customer order history and status tracking
- Admin dashboard for product and order management

## Core Domain Model

### User

- `id` (string/UUID)
- `name`
- `email` (unique)
- `passwordHash`
- `role` (`ADMIN`, `CUSTOMER`)
- `createdAt`, `updatedAt`

### Product

- `id` (string/UUID)
- `name`
- `category` (`WOOD`, `PAINTS`, `DESIGNS`)
- `basePrice` (money/integer cents or long)
- `description`
- `imageUrl`
- `inStock` (boolean)
- `createdAt`, `updatedAt`

### ProductType (variant/options per product)

- `id`
- `productId`
- `value` (internal key)
- `label` (display label)
- `priceModifier`

### Order

- `id` (public order code, e.g. `ORD-XXXXXX`, plus internal UUID if needed)
- `userId`
- `status` (`PENDING`, `PROCESSING`, `DELIVERED`)
- `paymentStatus` (`PAID`, `UNPAID`)
- `totalAmount`
- `paymentMethod` (`MOBILE`, `CARD`) (frontend currently captures this)
- `customerName`
- `customerPhone`
- `customerAddress`
- `createdAt`, `updatedAt`

### OrderItem

- `id`
- `orderId`
- `productId`
- `productNameSnapshot`
- `selectedType` (nullable label/value)
- `unitPrice`
- `quantity`
- `lineTotal`

## API Requirements

All APIs are JSON over HTTPS. Suggested base path: `/api/v1`.

### Auth

- `POST /auth/register`
  - Input: `name`, `email`, `password`
  - Output: user profile + access token
- `POST /auth/login`
  - Input: `email`, `password`
  - Output: user profile + access token
- `POST /auth/logout` (optional for JWT; useful for refresh-token revocation)
- `GET /auth/me`
  - Output: current authenticated user

### Products

- `GET /products`
  - Query params:
    - `category` (optional)
    - `search` (optional)
    - pagination support recommended (`page`, `size`, `sort`)
- `GET /products/{id}`
- Admin only:
  - `POST /products`
  - `PUT /products/{id}`
  - `DELETE /products/{id}`

### Orders

- `POST /orders` (authenticated customer)
  - Creates order from checkout payload:
    - `items[]` (`productId`, `selectedType`, `quantity`)
    - delivery fields (`customerName`, `customerPhone`, `customerAddress`)
    - `paymentMethod`
  - Backend computes authoritative prices and `totalAmount`
- `GET /orders/me` (authenticated customer)
  - Returns customer's own orders
- `GET /orders/{id}` (owner or admin)

### Admin Orders

- `GET /admin/orders` (admin)
  - Filter by `status`, `paymentStatus`, date range (recommended)
- `PATCH /admin/orders/{id}/status`
  - Body: `status`
- `PATCH /admin/orders/{id}/payment-status`
  - Body: `paymentStatus`

## Security Requirements

- Use Spring Security with JWT (access token; refresh token optional but recommended)
- Password hashing with BCrypt
- Role-based authorization:
  - Customer: own profile/orders only
  - Admin: full product/order management
- CORS configured for frontend origin(s)
- Basic request rate limiting for auth endpoints (recommended)

## Validation Rules

- Registration:
  - valid email format
  - password minimum length (>= 8 recommended)
  - unique email
- Product:
  - non-empty name/description
  - non-negative base price
  - valid category enum
- Order creation:
  - at least one item
  - quantity > 0
  - product and selected type must exist
  - customer name/phone/address required

## Data and Persistence

- Database: PostgreSQL (recommended for production readiness)
- JPA/Hibernate entities with migrations via Flyway or Liquibase
- Use seed data for local dev:
  - default admin user
  - starter product catalog

## Error Handling

- Consistent error response shape:
  - `timestamp`, `status`, `error`, `message`, `path`, `traceId` (optional)
- Standard HTTP codes:
  - `400` validation error
  - `401` unauthenticated
  - `403` unauthorized
  - `404` not found
  - `409` conflict (e.g., email already exists)
  - `500` server error

## Non-Functional Requirements

- Layered architecture:
  - controller -> service -> repository -> entity
- DTO separation (never expose entities directly)
- OpenAPI/Swagger documentation enabled
- Unit and integration tests for:
  - auth flows
  - order creation price integrity
  - admin authorization boundaries
- Logging with correlation/request ID support

## Frontend Integration Notes

- Current frontend uses local context/state; it must be refactored to call backend APIs:
  - `AuthContext`: login/register/me/logout APIs
  - `OrderContext`: order create/list/update APIs
  - `Index`/`ProductDetails`: product list/detail APIs
- Cart can remain client-side initially, with server-side pricing validation at checkout.

## Proposed Initial Backend Milestones

1. Bootstrap Spring Boot project with security, PostgreSQL, migrations, and OpenAPI.
2. Implement auth + user management with JWT.
3. Implement product catalog read endpoints.
4. Implement checkout order creation and customer order history.
5. Implement admin product/order management endpoints.
6. Connect frontend contexts to backend incrementally.

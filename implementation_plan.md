# Stock Transfer Feature Implementation Plan

## Overview

Add a **Stock Transfer** feature that allows:
- **Admin** (any admin) or the **Manager of the source branch** to initiate a transfer
- Reduces `ProductUnit.quantity` at the source branch immediately
- Does **NOT** auto-increase the receiving branch — the receiving branch must accept the transfer
- Creates two `ProductUnitLog` entries (`transfer_out` on source, `transfer_in` pending on destination)
- Sends a **Notification** to managers/admins of the receiving branch

---

## Key Design Decisions

> [!IMPORTANT]
> **Transfer flow (two-phase):**
> 1. **Initiate Transfer** — stock is deducted from source branch immediately. A `StockTransfer` record with status `pending` is created. Two logs are written: `transfer_out` (source, qty reduced) and `transfer_in` (destination, **quantity NOT yet added**).
> 2. **Receive Transfer (future scope)** — the destination branch manager confirms receipt, at which point `ProductUnit.quantity` on the destination branch is incremented and the transfer status becomes `completed`.
>
> The `transfer_in` log records that a transfer is *incoming* but `current_qty` on the destination unit is not yet updated.

> [!IMPORTANT]
> **Authorization:**
> - Admins (any) can initiate any transfer
> - Manager can only initiate if their `branch_id === from_branch_id`
> - Both `from_branch_id` and `to_branch_id` must differ

> [!NOTE]
> **Notifications** are stored in a new `Notification` DB table and pushed to the receiving branch's managers and all admins. No real-time socket — pure DB-based polling/fetch.

---

## Proposed Changes

### 1. Prisma Schema

#### [MODIFY] [schema.prisma](file:///c:/Users/sover/OneDrive/Desktop/you%20know%20who/chatbot_pos/orm_backend/prisma/schema.prisma)

Add two new models:
- **`StockTransfer`** — tracks the transfer request with status (`pending`, `completed`, `cancelled`)
- **`Notification`** — stores notifications for target users

Add `StockTransfer` relations to `Branch`, `User`, and `ProductItem`.  
Add `Notification` relation to `User`.

New enums:
- `StockTransferStatus { pending, completed, cancelled }`
- `NotificationType { transfer_request, transfer_received, transfer_cancelled, general }`

---

### 2. New Feature Files

#### [NEW] `app/services/stockTransfer.service.js`
Core business logic:
- `initiate(data, requestingUser)` — validates permissions, deducts source stock, creates `StockTransfer` record, creates both `ProductUnitLog` entries, creates notifications
- `getAll(filters)` — paginated listing with filters (status, from_branch, to_branch, date)
- `getById(id)` — single transfer with logs
- `cancel(id, requestingUser)` — cancel a pending transfer (reverses the source deduction, adds notes)

#### [NEW] `app/controllers/stockTransfer.controller.js`
Thin controller wrapping service methods.

#### [NEW] `app/validations/stockTransfer.validation.js`
Validators:
- `initiateTransfer` — required `product_item_id`, `from_branch_id`, `to_branch_id`, `quantity` (positive int), optional `notes`
- `getAllTransfers` — optional filters
- `getTransferById` — param `id`

#### [NEW] `app/routes/stockTransfer.routes.js`
| Method | Path | Access |
|--------|------|--------|
| `POST` | `/stock-transfers` | `verifyToken` + custom `authorizeTransfer` middleware |
| `GET` | `/admin/stock-transfers` | `verifyToken` + `isAdmin` |
| `GET` | `/admin/stock-transfers/:id` | `verifyToken` + `isAdmin` |
| `GET` | `/manager/stock-transfers` | `verifyToken` + `isManager` |

#### [NEW] `app/middlewares/authorizeTransfer.js`
Custom middleware:
- Allows if `req.user.role === 'admin'`
- Allows if `req.user.role === 'manager'` AND `req.user.branch_id === req.body.from_branch_id`
- Rejects with `403` otherwise

---

### 3. Notification Feature Files

#### [NEW] `app/services/notification.service.js`
- `createForUsers(userIds, payload)` — bulk create notifications
- `getMyNotifications(userId, filters)` — paginated fetch
- `markAsRead(notificationId, userId)` — mark single notification read
- `markAllAsRead(userId)` — mark all read

#### [NEW] `app/controllers/notification.controller.js`
Thin controller.

#### [NEW] `app/validations/notification.validation.js`
Validators for listing/marking read.

#### [NEW] `app/routes/notification.routes.js`
| Method | Path | Access |
|--------|------|--------|
| `GET` | `/notifications` | `verifyToken` (any authenticated user) |
| `PATCH` | `/notifications/:id/read` | `verifyToken` |
| `PATCH` | `/notifications/read-all` | `verifyToken` |

---

## Verification Plan

### Automated Tests
- No automated test runner configured; will verify manually.

### Manual Verification
1. Run `npx prisma migrate dev --name add_stock_transfer_notifications` after schema changes
2. Call `POST /stock-transfers` as an admin → expect source qty reduced, two logs, notification created
3. Call `POST /stock-transfers` as the source branch manager → success
4. Call `POST /stock-transfers` as a manager of a different branch → expect 403
5. Call `GET /notifications` as a manager of the destination branch → expect notification present
6. Call `PATCH /notifications/:id/read` → expect `is_read: true`

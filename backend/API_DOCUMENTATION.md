# Student Organization Management System - API Documentation

A complete, enterprise-grade Authentication & Authorization System built with **Django REST Framework (DRF)**, **PostgreSQL**, **SimpleJWT**, and custom **Role-Based Access Control (RBAC)**.

---

## 1. System Architecture & Tech Stack

- **Framework**: Django 5.2 & Django REST Framework (DRF) 3.16
- **Database**: PostgreSQL (with automatic configurable fallback for local dev)
- **Authentication**: JSON Web Tokens (SimpleJWT with Token Blacklisting)
- **Password Security**: Django PBKDF2 with SHA-256 (minimum 8 characters, complexity validation)
- **CORS**: `django-cors-headers` configured for Vite/React frontend integration
- **Exception Handling**: Standardized unified JSON response schema across all endpoints

---

## 2. Roles & Permissions Matrix

| Capability / Endpoint | MEMBER | TREASURER | ADMIN |
|---|:---:|:---:|:---:|
| **Self-Registration** (`POST /api/auth/register/`) | ✅ | ❌ | ❌ |
| **Login & Obtain JWT** (`POST /api/auth/login/`) | ✅ | ✅ | ✅ |
| **Refresh Token & Logout** | ✅ | ✅ | ✅ |
| **Forgot / Reset / Change Password** | ✅ | ✅ | ✅ |
| **View Profile** (`GET /api/auth/me/`) | ✅ | ✅ | ✅ |
| **Create Treasurer** (`POST /api/admin/create-treasurer/`) | ❌ | ❌ | ✅ |
| **View All Members** (`GET /api/admin/members/`) | ❌ | ❌ | ✅ |
| **View Events** (`GET /api/events/`) | ✅ | ✅ | ✅ |
| **Create / Manage Events** (`POST/PUT/DELETE /api/events/`) | ❌ | ❌ | ✅ |
| **Apply as Volunteer** (`POST /api/volunteer/apply/`) | ✅ | ❌ | ❌ |
| **View My Volunteer Applications** (`GET /api/volunteer/my-applications/`) | ✅ | ❌ | ❌ |
| **Review Volunteer Requests** (`GET /api/admin/volunteers/`) | ❌ | ❌ | ✅ |
| **Approve / Reject Volunteers** | ❌ | ❌ | ✅ |
| **Access Finance Summary** (`GET /api/finance/`) | ❌ | ✅ | ✅ |
| **Record Transactions** (`POST /api/finance/transactions/`) | ❌ | ✅ | ✅ |
| **Submit Reimbursement Claim** (`POST /api/finance/reimbursements/`) | ✅ | ✅ | ✅ |
| **Approve / Reject Reimbursements** | ❌ | ✅ | ✅ |

---

## 3. Directory & Folder Structure

```
backend/
├── config/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py           # PostgreSQL, SimpleJWT, CORS, Exception Handler
│   ├── urls.py               # Root URL router
│   └── wsgi.py
├── accounts/                 # Authentication & User Management App
│   ├── management/commands/
│   │   ├── create_admin.py   # CLI command to create admin accounts
│   │   └── seed_data.py      # Seeds sample users, events, and transactions
│   ├── exceptions.py         # Standardized error handling
│   ├── models.py             # Custom User model (MEMBER, ADMIN, TREASURER)
│   ├── permissions.py        # IsAdmin, IsTreasurer, IsMember, IsOwnerOrAdmin
│   ├── serializers.py        # Registration, Login, Password, Profile
│   ├── tests.py              # Auth unit tests
│   ├── urls.py               # Auth & Admin routing
│   └── views.py              # Auth API views
├── volunteers/               # Events & Volunteer Management App
│   ├── models.py             # Event & VolunteerApplication models
│   ├── serializers.py        # Event, Application, and Review serializers
│   ├── tests.py              # Volunteer flow unit tests
│   ├── urls.py               # Event and Volunteer routes
│   └── views.py              # Member application & Admin review views
├── finance/                  # Finance & Reimbursement App
│   ├── models.py             # Transaction & ReimbursementRequest models
│   ├── serializers.py        # Finance serializers
│   ├── tests.py              # Finance flow unit tests
│   ├── urls.py               # Finance routing
│   └── views.py              # Dashboard, Transaction, and Review views
├── .env.example              # Environment variables template
├── .env                      # Active local configuration
├── requirements.txt          # Python dependencies
└── manage.py
```

---

## 4. Setup & Running the Backend

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and set your PostgreSQL credentials:
```ini
DB_ENGINE=django.db.backends.postgresql
DB_NAME=student_org_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
USE_SQLITE=False
```

### Step 3: Run Database Migrations
```bash
python manage.py makemigrations accounts volunteers finance
python manage.py migrate
```

### Step 4: Seed Sample Data
```bash
python manage.py seed_data
```

### Step 5: Start the Development Server
```bash
python manage.py runserver
```

---

## 5. Seeded Test Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@studentorg.edu` | `AdminPassword123!` | Full organizational access |
| **Treasurer** | `treasurer@studentorg.edu` | `TreasurerPassword123!` | Finance and reimbursement approvals |
| **Member 1** | `alex.rivera@studentorg.edu` | `MemberPassword123!` | Student ID: `STU-2026-001` |
| **Member 2** | `sarah.chen@studentorg.edu` | `MemberPassword123!` | Student ID: `STU-2026-002` |

---

## 6. API Reference

### 6.1 Authentication Endpoints

#### 1. Member Self-Registration
- **Endpoint**: `POST /api/auth/register/`
- **Access**: Public
- **Request Body**:
```json
{
  "full_name": "Jordan Taylor",
  "student_id": "STU-2026-004",
  "email": "jordan.taylor@studentorg.edu",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Member registered successfully.",
  "access": "eyJhbGciOi...",
  "refresh": "eyJhbGciOi...",
  "role": "MEMBER",
  "user": {
    "id": 4,
    "full_name": "Jordan Taylor",
    "student_id": "STU-2026-004",
    "email": "jordan.taylor@studentorg.edu",
    "role": "MEMBER",
    "is_active": true,
    "created_at": "2026-10-03T14:00:00Z"
  }
}
```

#### 2. User Login (All Roles)
- **Endpoint**: `POST /api/auth/login/`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@studentorg.edu",
  "password": "AdminPassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "access": "eyJhbGciOi...",
  "refresh": "eyJhbGciOi...",
  "role": "ADMIN",
  "user": {
    "id": 1,
    "full_name": "System Administrator",
    "email": "admin@studentorg.edu",
    "student_id": null,
    "role": "ADMIN",
    "is_active": true,
    "created_at": "2026-10-03T14:00:00Z"
  }
}
```

#### 3. Refresh Access Token
- **Endpoint**: `POST /api/auth/token/refresh/`
- **Access**: Public
- **Request Body**:
```json
{
  "refresh": "eyJhbGciOi..."
}
```
- **Response (200 OK)**:
```json
{
  "access": "eyJhbGciOi..."
}
```

#### 4. Logout & Blacklist Token
- **Endpoint**: `POST /api/auth/logout/`
- **Access**: Authenticated (`Bearer <access_token>`)
- **Request Body**:
```json
{
  "refresh": "eyJhbGciOi..."
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully. Token blacklisted."
}
```

#### 5. Change Password
- **Endpoint**: `POST /api/auth/change-password/`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "old_password": "MemberPassword123!",
  "new_password": "NewSecurePassword456!",
  "confirm_new_password": "NewSecurePassword456!"
}
```

#### 6. Forgot Password Request
- **Endpoint**: `POST /api/auth/forgot-password/`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "alex.rivera@studentorg.edu"
}
```

#### 7. Reset Password
- **Endpoint**: `POST /api/auth/reset-password/`
- **Access**: Public
- **Request Body**:
```json
{
  "uidb64": "NA",
  "token": "d04v43-1cf0e...",
  "new_password": "BrandNewPassword123!",
  "confirm_new_password": "BrandNewPassword123!"
}
```

---

### 6.2 Administrator Endpoints

#### 1. Create Treasurer
- **Endpoint**: `POST /api/admin/create-treasurer/`
- **Permission**: `IsAdmin`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Request Body**:
```json
{
  "full_name": "Elena Rostova",
  "email": "treasurer2@studentorg.edu",
  "password": "TreasurerPass2026!"
}
```

#### 2. View Organization Members
- **Endpoint**: `GET /api/admin/members/?search=alex`
- **Permission**: `IsAdmin`

---

### 6.3 Volunteer Flow Endpoints

#### 1. Member Applies for Volunteer Role
- **Endpoint**: `POST /api/volunteer/apply/`
- **Permission**: `IsMember`
- **Headers**: `Authorization: Bearer <MEMBER_ACCESS_TOKEN>`
- **Request Body**:
```json
{
  "event": 1,
  "notes": "Available all weekend to handle registration and attendee logistics."
}
```

#### 2. Member Views Their Applications
- **Endpoint**: `GET /api/volunteer/my-applications/`
- **Permission**: `IsMember`

#### 3. Admin Views Volunteer Applications
- **Endpoint**: `GET /api/admin/volunteers/?status=PENDING`
- **Permission**: `IsAdmin`

#### 4. Admin Approves Application
- **Endpoint**: `POST /api/admin/volunteers/1/approve/`
- **Permission**: `IsAdmin`
- **Request Body**:
```json
{
  "admin_feedback": "Approved! Please report to Stage A at 8:00 AM."
}
```

#### 5. Admin Rejects Application
- **Endpoint**: `POST /api/admin/volunteers/1/reject/`
- **Permission**: `IsAdmin`
- **Request Body**:
```json
{
  "admin_feedback": "Capacity has been reached for this role."
}
```

---

### 6.4 Finance & Treasurer Endpoints

#### 1. Finance Summary Dashboard
- **Endpoint**: `GET /api/finance/`
- **Permission**: `IsTreasurer` (Treasurer or Admin)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "total_income": 7500.0,
    "total_expenses": 1200.0,
    "net_balance": 6300.0,
    "pending_reimbursements_count": 1,
    "recent_transactions": [...]
  }
}
```

#### 2. Record Transaction
- **Endpoint**: `POST /api/finance/transactions/`
- **Permission**: `IsTreasurer`
- **Request Body**:
```json
{
  "title": "Spring Hackathon Refreshments",
  "amount": 450.00,
  "transaction_type": "EXPENSE",
  "category": "EVENT_EXPENSE",
  "description": "Purchased pizza and soft drinks for participants.",
  "date": "2026-10-03"
}
```

#### 3. Approve Reimbursement
- **Endpoint**: `POST /api/finance/reimbursements/1/approve/`
- **Permission**: `IsTreasurer`
- **Request Body**:
```json
{
  "treasurer_notes": "Receipt verified and reimbursement issued."
}
```
*(Note: Approving a reimbursement automatically creates an EXPENSE Transaction record in the ledger).*

---

## 7. Testing

Execute the test suite with:
```bash
python manage.py test
```

All 21 comprehensive test cases validate:
- Member self-registration with duplicate checks
- Admin & Treasurer manual creation and login
- JWT token lifecycle and blacklist verification
- Role-Based Access Control on all protected paths
- Volunteer application and approval lifecycle
- Finance transactions and reimbursement workflows

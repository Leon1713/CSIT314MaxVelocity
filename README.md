# Fundly

A web platform that connects fundraisers with donees to foster community-driven support.

Made by Jia Yuan, Chloe, Tara, Yaz, Yadyoo & Hanyi.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| Database | MySQL |
| CSS Framework | Bootstrap 5.3 |

---

## Project Structure

```
fundly/
├── pages/              # HTML pages
├── scripts/            # Frontend JavaScript
├── styles/             # CSS
├── img/                # Images
├── Controller/         # Business logic layer
├── Entity/             # Database models (Account, Session, Profile)
├── DTO/                # Data transfer objects
├── Dependencies/       # Auth helpers, session cleanup
├── routes/             # FastAPI route handlers
├── main.py             # App entry point
├── db.py               # Database connection
└── schema.sql          # Database schema & seed data
```

---

## Pages

| Page | File | Description |
|---|---|---|
| Landing | `index.html` | Public landing page |
| About | `about.html` | About us page |
| Sign In | `login.html` | Login form |
| Sign Up | `sign_up.html` | Registration form |
| Hub | `hub.html` | Post-login dashboard, role-based |
| Admin Dashboard | `admin_dashboard.html` | User account management |
| Fundraiser Dashboard | `fundraiser_dashboard.html` | Fundraiser view |
| Donee Dashboard | `donee_dashboard.html` | Donee view |
| Platform Dashboard | `platform_dashboard.html` | Platform management view |

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/signup` | Register a new user |
| `POST` | `/login` | Authenticate and create session |
| `GET` | `/session` | Validate current session cookie |
| `POST` | `/logout` | Invalidate session and clear cookie |
| `GET` | `/admin/dashboard` | Get current admin's info |
| `GET` | `/admin/user_accounts` | List all user accounts |
| `GET` | `/admin/user_accounts/{id}` | Get a user by ID |
| `PATCH` | `/admin/user_accounts/{id}` | Update a user |
| `POST` | `/admin/user_accounts/{id}/suspend` | Suspend a user |
| `POST` | `/admin/create_account` | Create a user account (admin only) |

---

## User Roles

| Role ID | Role Name | Description | Hub Buttons |
|---|---|---|---|
| 1 | `user_admin` | Manages user accounts | All 4 buttons |
| 2 | `fund_raiser` | Creates and manages fundraisers | Fundraiser |
| 3 | `donee` | Searches and donates | Donee |
| 4 | `platform_mgmt` | Manages categories & reports | Platform Mgmt |

---

## Getting Started

### Prerequisites

- Python 3.10+
- MySQL
- A static file server (e.g. VS Code Live Server on port 5500)

### 1. Set up the database

```sql
mysql -u root -p < schema.sql
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fundraising_db
```

### 3. Install Python dependencies

```bash
pip install fastapi uvicorn mysql-connector-python passlib[argon2] python-dotenv pydantic[email]
```

### 4. Run the backend

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 5. Serve the frontend

Open the project in VS Code and use Live Server (port 5500), or any static file server pointing at the project root.

### Default Admin Account

| Field | Value |
|---|---|
| Email | `admin@fundraise.com` |
| Password | `Admin@1234` |
| Role | User Admin |

---

## Session & Auth Flow

1. User submits login credentials → `POST /login` → session token set as an `httponly` cookie
2. Every protected page calls `GET /session` on load to verify the cookie
3. If session is invalid or missing, the user is redirected to `login.html`
4. Logout calls `POST /logout` → session marked inactive in DB, cookie cleared
5. Expired sessions are automatically cleaned up on server startup

# Batua — Expense & Budget Management System

A full-stack personal finance web application for tracking income and expenses, setting budgets, and visualising spending patterns. Built with a microservices backend and a React frontend, with a focus on clean API design, secure authentication, and real-world usability.

---

## Features

### Authentication & Security
- JWT-based authentication with httpOnly cookie storage (access + refresh tokens)
- Secure password hashing with bcrypt
- Email verification on registration via Resend
- Forgot password / reset password flow with time-limited tokens
- Protected routes with automatic token refresh

### Transactions
- Add income and expense transactions with amount, category, date, and note
- Attach expense proof (image or PDF, up to 5 MB)
- Filter transactions by type (all / income / expense)
- Real-time summary: total income, expenses, and balance

### Dashboard & Analytics
- Overview cards: balance, income, expenses
- Cash flow area chart (income vs expenses over time)
- Daily spending bar chart
- Expense breakdown pie chart by category
- Recent transactions feed

### Budget Management
- Set monthly category budgets *(budget service — in progress)*
- Visual progress bars showing spent vs budgeted
- Overspend alerts

### Account Management
- View profile and account details
- Delete account with confirmation

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API Framework | FastAPI (Python) |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Email | Resend |
| Validation | Pydantic v2 |
| Server | Uvicorn |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 (Vite) |
| Routing | React Router v7 |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Auth State | React Context + httpOnly cookies |

### Infrastructure
| Layer | Technology |
|---|---|
| Containerisation | Docker + Docker Compose |
| Architecture | Microservices (user_service, transaction_service, budget_service) |
| Cache / Session | Redis |

---

## Architecture


Each service owns its own database. JWT verification is performed independently per service using a shared secret — no cross-service database calls.

---

## Core API Endpoints

### User Service — `http://localhost:8000`

#### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register and send verification email |
| POST | `/auth/login` | Login, sets access + refresh token cookies |
| POST | `/auth/logout` | Clear auth cookies |
| POST | `/auth/refresh` | Refresh access token using refresh cookie |
| GET | `/auth/verify-email?token=` | Verify email address |
| GET | `/auth/status` | Check if current session is authenticated |
| POST | `/auth/forgot-password` | Send password reset link to email |
| POST | `/auth/reset-password` | Reset password with token |

#### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Get current user profile |
| DELETE | `/users/me` | Delete account and clear session |

---

### Transaction Service — `http://localhost:8001`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/transactions/` | Create a transaction (multipart/form-data) |
| GET | `/transactions/` | List transactions (filterable by type, date range) |
| PUT | `/transactions/{id}` | Update a transaction |
| DELETE | `/transactions/{id}` | Delete a transaction |
| GET | `/transactions/summary` | Get total income, expense, and balance |

All transaction endpoints require a valid `access_token` cookie. Transactions are scoped to the authenticated user via the JWT `sub` claim.

---

## Running Locally

### Prerequisites
- Docker Desktop

### Start everything

```bash
docker-compose up --build
```

This starts all databases, backend services, and the frontend in the correct order. The frontend is available at `http://localhost:5173`.

### Stop everything

```bash
docker-compose down
```

### Wipe all data and start fresh

```bash
docker-compose down -v
docker-compose up --build
```

---

## Project Structure

```
Money_Manager/
├── backend/
│   ├── user_service/
│   │   ├── app/
│   │   │   ├── api/routes/     # auth.py, users.py
│   │   │   ├── core/           # config, security
│   │   │   ├── db/             # models, session
│   │   │   ├── schemas/        # pydantic schemas
│   │   │   └── services/       # email.py, token_blacklist.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── transaction_service/
│   │   ├── app/
│   │   │   ├── api/routes/     # transactions.py
│   │   │   ├── core/           # config
│   │   │   ├── db/             # models, session
│   │   │   └── schemas/        # transaction.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── budget_service/         # in progress
├── frontend/
│   ├── src/
│   │   ├── api/                # userApi.js, transactionApi.js
│   │   ├── components/         # Layout, charts
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── pages/              # Dashboard, Transactions, Budgets, etc.
│   │   └── routes/             # ProtectedRoute
│   ├── Dockerfile
│   └── vite.config.js
└── docker-compose.yml
```

---

## Environment Variables

### user_service `.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET_KEY` | Secret for signing JWTs |
| `RESEND_API_KEY` | Resend API key for emails |
| `EMAIL_FROM` | Sender address |
| `FRONTEND_URL` | Used to build email links |

### transaction_service `.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Same secret as user_service for token verification |

---

## License

MIT

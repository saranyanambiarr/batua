# Batua — Expense & Budget Management System

A full-stack personal finance web application for tracking income and expenses, setting budgets, and visualising spending patterns. Built with a microservices backend and a React frontend, with a focus on clean API design, secure authentication, observability, and real-world usability.

---

## Features

### Authentication & Security
- JWT-based authentication with httpOnly cookie storage (access + refresh tokens)
- Secure password hashing with bcrypt
- Email verification on registration via Resend
- Forgot password / reset password flow with time-limited tokens
- Proactive token refresh every 12 minutes; 30-minute inactivity autologout
- Global 401 interceptor with automatic token retry before logout

### Transactions
- Add, edit, and delete income and expense transactions with amount, category, date, note, and comment
- Keyword-based auto-detection of category from free-text input with manual override
- Filter transactions by type (all / income / expense) and by category
- Real-time summary: total income, expenses, and balance

### Budget Management
- Set monthly category budgets
- Visual progress bars showing spent vs budgeted amount
- Over-budget alert banner listing exceeded categories
- Spent amount calculated directly from transaction data — no inter-service HTTP calls

### Dashboard & Analytics
- Overview cards: balance, income, expenses
- Cash flow grouped bar chart (income vs expenses by day)
- Daily spending bar chart
- Expense breakdown pie chart by category with legend
- Budget progress section (up to 4 budgets with overflow count)
- Recent transactions feed

### Charts
- Cash flow chart: income vs expense by day
- Monthly trend chart: income vs expense over last 6 months
- Daily spending bar chart
- Expense breakdown pie chart with category table (amount, %, transaction count)

### Calendar
- Monthly calendar view with real transaction amounts per day
- Month navigation (prev / next) to browse history
- Colour-coded income (green) and expense (red) entries per day

### Export
- Export transactions to CSV or PDF
- Period filter: this month / last month / last 3 months / all time
- PDF includes branded header, income/expense/balance summary strip, and formatted table with coloured amounts
- Live preview table that updates with the selected period

### Observability
- Prometheus metrics on all three services via `prometheus-fastapi-instrumentator`
- Pre-built Grafana dashboard: request rate, error rate, P50/P95 latency, total request counters
- Structured JSON request logging (method, path, status, duration_ms) on every service
- Grafana auto-provisioned with Prometheus datasource and dashboard on container start

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
| Cache / Token Blacklist | Redis |
| Email | Resend |
| Validation | Pydantic v2 |
| Server | Uvicorn |
| Metrics | prometheus-fastapi-instrumentator |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 (Vite) |
| Routing | React Router v7 |
| Styling | Tailwind CSS |
| Charts | Recharts |
| PDF Export | jsPDF + jspdf-autotable |
| Animations | Framer Motion |
| Auth State | React Context + httpOnly cookies |

### Infrastructure
| Layer | Technology |
|---|---|
| Containerisation | Docker + Docker Compose |
| Architecture | Microservices (user_service, transaction_service, budget_service) |
| Cache / Session | Redis |
| Metrics Collection | Prometheus |
| Metrics Visualisation | Grafana |

---

## Architecture

Each service owns its own PostgreSQL database. JWT verification is performed independently per service using a shared secret — no cross-service HTTP calls for auth. The budget service reads transaction data directly via a read-only SQLAlchemy connection to the transaction database to compute monthly spend per category.

```
┌─────────────┐     ┌───────────────────┐     ┌──────────────────────┐
│   Frontend  │────▶│   user_service    │────▶│      user_db         │
│  React/Vite │     │   :8000           │     │   PostgreSQL :5432   │
└─────────────┘     └───────────────────┘     └──────────────────────┘
                    ┌───────────────────┐     ┌──────────────────────┐
                    │transaction_service│────▶│   transaction_db     │
                    │   :8001           │     │   PostgreSQL :5433   │
                    └───────────────────┘     └──────────────────────┘
                    ┌───────────────────┐     ┌──────────────────────┐
                    │  budget_service   │────▶│     budget_db        │
                    │   :8002           │     │   PostgreSQL :5434   │
                    └───────────────────┘     └──────────────────────┘
                                │ (read-only)  ┌──────────────────────┐
                                └─────────────▶│   transaction_db     │
                                               └──────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Prometheus :9090  ◀──scrapes /metrics──  all three services        │
│  Grafana :3000     ◀──queries──  Prometheus                         │
│  Redis :6379       ◀──token blacklist──  user_service               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core API Endpoints

### User Service — `http://localhost:8000`

#### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register and send verification email |
| POST | `/auth/login` | Login, sets access + refresh token cookies |
| POST | `/auth/logout` | Clear auth cookies, blacklist token in Redis |
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

### Budget Service — `http://localhost:8002`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets/` | List all budgets with real-time spent amount |
| POST | `/budgets/` | Create a budget for a category |
| PUT | `/budgets/{id}` | Update a budget amount |
| DELETE | `/budgets/{id}` | Delete a budget |

Spent amount is calculated via direct SQL query to transaction_db — no inter-service HTTP call.

---

## Observability

### Prometheus
Scrapes `/metrics` on all three services every 15 seconds. Available at `http://localhost:9090`.

Useful queries:
```promql
# Request rate per service
rate(http_requests_total[1m])

# Error rate (4xx + 5xx)
rate(http_requests_total{status_code=~"4..|5.."}[1m])

# P95 latency for user_service
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="user_service"}[1m]))

# CPU usage per service
rate(process_cpu_seconds_total[1m])
```

### Grafana
Pre-provisioned dashboard at `http://localhost:3000` (admin / admin). Shows:
- Request rate (req/s) per endpoint
- Error rate (4xx + 5xx req/s)
- P50 and P95 latency
- Total request counters

---

## Running Locally

### Prerequisites
- Docker Desktop

### Start everything

```bash
docker-compose up --build
```

This starts all databases, backend services, frontend, Prometheus, and Grafana in the correct dependency order.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| User Service | http://localhost:8000 |
| Transaction Service | http://localhost:8001 |
| Budget Service | http://localhost:8002 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |

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
│   │   │   ├── core/           # config, security, logging
│   │   │   ├── db/             # models, session
│   │   │   ├── schemas/        # pydantic schemas
│   │   │   └── services/       # email.py, token_blacklist.py
│   │   ├── Dockerfile
│   │   ├── railway.toml
│   │   └── requirements.txt
│   ├── transaction_service/
│   │   ├── app/
│   │   │   ├── api/routes/     # transactions.py
│   │   │   ├── core/           # config, logging
│   │   │   ├── db/             # models, session
│   │   │   └── schemas/        # transaction.py
│   │   ├── Dockerfile
│   │   ├── railway.toml
│   │   └── requirements.txt
│   └── budget_service/
│       ├── app/
│       │   ├── api/routes/     # budgets.py
│       │   ├── core/           # config, logging
│       │   ├── db/             # models, session (two engines)
│       │   └── schemas/        # budget.py
│       ├── Dockerfile
│       ├── railway.toml
│       └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                # userApi.js, transactionApi.js, budgetApi.js, fetch.js
│   │   ├── components/         # Layout, charts (CashFlow, Pie, Bar, MonthlyTrend)
│   │   ├── context/            # AuthContext (refresh + inactivity), ThemeContext
│   │   ├── pages/              # Dashboard, Transactions, Budgets, Charts, Calendar, Export, Profile
│   │   └── routes/             # ProtectedRoute
│   ├── Dockerfile
│   ├── railway.toml
│   ├── vercel.json
│   └── vite.config.js
├── monitoring/
│   ├── prometheus.yml                          # scrape config for all 3 services
│   └── grafana/
│       ├── provisioning/datasources/           # auto-wires Prometheus
│       └── dashboards/batua.json              # pre-built Grafana dashboard
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
| `FRONTEND_URL` | Used to build email links and CORS origin |

### transaction_service `.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET_KEY` | Same secret as user_service for token verification |
| `FRONTEND_URL` | CORS allowed origin |

### budget_service `.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string for budget_db |
| `TRANSACTION_DATABASE_URL` | Read-only connection to transaction_db |
| `JWT_SECRET_KEY` | Same secret as user_service for token verification |
| `FRONTEND_URL` | CORS allowed origin |

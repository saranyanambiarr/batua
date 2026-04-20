Expense & Budget Management System

A full-stack web application for tracking daily and monthly income and expenses, setting budgets, and visualizing financial insights. The system is designed with a FastAPI backend and a modern React frontend, focusing on clean API design, performance, and real-world usability.

This project was built as a learning-focused yet production-oriented system to understand full-stack development, including authentication, API design, database modeling, file uploads, data aggregation, and frontend-backend integration.

⸻

🚀 Features

🔐 Authentication & Security
	•	JWT-based user authentication (login & registration)
	•	Secure password hashing
	•	Protected routes using token-based access control

💰 Expense & Income Management
	•	Add, update, and delete income and expense transactions
	•	Track transactions by date, category, and type (income/expense)
	•	Support for daily and monthly expense tracking

📊 Analytics & Insights
	•	Monthly and daily financial summaries
	•	Category-wise expense breakdowns
	•	Interactive charts for income vs expenses and spending distribution

🧾 Expense Proof Uploads
	•	Attach images (e.g., food items, receipts) to expense entries
	•	Multipart file upload handling
	•	Secure image storage integration (S3 / Cloudinary ready)

📉 Budget Management
	•	Set monthly spending budgets
	•	Real-time overspending detection
	•	Budget-limit alerts when expenses exceed the configured threshold

🎨 Frontend Experience
	•	Responsive and intuitive UI
	•	Dashboard-style layout inspired by popular money management apps
	•	Optimized data fetching and state management

⸻

🏗️ Tech Stack

Backend
	•	FastAPI – REST API framework
	•	Python
	•	SQLAlchemy – ORM
	•	PostgreSQL / SQLite – Database
	•	Pydantic – Data validation
	•	JWT – Authentication
	•	Alembic – Database migrations

Frontend
	•	React (Vite / Next.js)
	•	Tailwind CSS – Styling
	•	Chart.js / Recharts – Data visualization

⸻

🧠 System Architecture

Frontend (React)
   |
   | REST APIs (JSON)
   v
Backend (FastAPI)
   |
   | SQLAlchemy ORM
   v
Database (PostgreSQL / SQLite)

	•	Stateless authentication using JWT
	•	Clean separation of concerns (API, business logic, data layer)
	•	Chart-friendly aggregation APIs for analytics

⸻

📁 Project Structure

backend/
├── app/
│   ├── api/            # API routes
│   ├── core/           # Config & security
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── db/             # Database session & base
│   └── main.py         # App entry point
└── alembic/            # Migrations

frontend/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Screens / routes
│   ├── services/       # API integration
│   └── hooks/          # State & data hooks


⸻

⚙️ Core API Endpoints (Sample)
	•	POST /auth/register – User registration
	•	POST /auth/login – User login
	•	POST /transactions – Add income/expense
	•	GET /transactions?from=&to= – Fetch transactions by date range
	•	GET /transactions/summary/monthly – Monthly analytics
	•	POST /budget – Set monthly budget
	•	POST /upload – Upload expense image

⸻

📈 Learning Objectives & Highlights
	•	Designed RESTful APIs with real-world business logic
	•	Implemented secure authentication and session handling
	•	Built efficient aggregation queries for financial analytics
	•	Integrated frontend dashboards with backend data contracts
	•	Handled file uploads and media storage securely
	•	Applied clean architecture and scalable design principles

⸻

🛣️ Future Enhancements
	•	Category-wise budgets
	•	Email / push notifications for budget alerts
	•	Caching layer for analytics APIs
	•	Export transactions as CSV/PDF
	•	Multi-currency support

⸻

📌 Resume Summary

Built a full-stack expense and budget management web application using FastAPI and React. Implemented secure authentication, transaction management, analytics dashboards, budget enforcement, and image-based expense logging with a focus on performance, scalability, and clean system design.

⸻

🤝 Contributing

This project is actively evolving as part of a learning journey. Contributions, suggestions, and improvements are welcome.

⸻

📄 License

MIT License
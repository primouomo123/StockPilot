# StockPilot

StockPilot is a full-stack inventory management application for tracking products, categories, stock movement, and account information. The app uses a Flask REST API with a React frontend and PostgreSQL for persistent data storage. It includes authentication, inventory analytics, product and category management, and stock movement tracking.

## Features

- User signup, login, and profile management
- Protected routes and authenticated API access
- Dashboard with inventory summary, low-stock alerts, and recent activity
- Category management with create, edit, delete, search, and pagination
- Product management with add, edit, delete, search, and pagination
- Transaction tracking for stock in/out activity with date filters
- Responsive UI built with Material UI

## API Routes

All backend routes are namespaced under `/api`.

- `POST /api/signup` - create a new user account
- `POST /api/login` - log in and receive auth tokens
- `POST /api/logout` - log out the current user
- `POST /api/refresh` - refresh the access token
- `GET /api/me` - get the current user profile
- `PATCH /api/me` - update the current user profile
- `DELETE /api/me` - delete the current user account
- `GET /api/summary` - dashboard summary data
- `GET /api/categories` - list the current user's categories
- `POST /api/categories` - create a category
- `GET /api/categories/<id>` - get a single category
- `PATCH /api/categories/<id>` - update a category
- `DELETE /api/categories/<id>` - delete a category
- `GET /api/products` - list the current user's products
- `POST /api/products` - create a product
- `GET /api/products/<id>` - get a single product
- `PATCH /api/products/<id>` - update a product
- `DELETE /api/products/<id>` - delete a product
- `GET /api/transactions` - list the current user's transactions
- `POST /api/transactions` - create a transaction
- `GET /api/transactions/<id>` - get a single transaction

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Material UI

### Backend

- Flask
- Flask-RESTful
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- Flask-CORS
- Marshmallow
- PostgreSQL

## Setup and Run Instructions

### Prerequisites

- Node.js and npm
- Python 3.12+
- Pipenv
- PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/primouomo123/StockPilot.git
cd StockPilot
```

### 2. Configure the backend

Create a `server/.env` file with your environment variables. Example:

```env
SECRET_KEY=your-secret-key
DATABASE_URI=sqlite:///app.db
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_COOKIE_SECURE=false
JWT_COOKIE_SAMESITE=Lax
JWT_COOKIE_CSRF_PROTECT=false
```


### 3. Install and run the backend

```bash
cd server
pipenv install
pipenv run flask db upgrade
pipenv run python seed.py
pipenv run python app.py
```

The API runs on `http://localhost:5555`.

### 4. Configure the frontend

Create a `client/.env` file:

```env
VITE_API_ENDPOINT=http://localhost:5555/api
```


### 5. Install and run the frontend

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`. Please ensure you run it on `http://localhost:5173`
and not on `http://127.0.0.1:5173`.


## Deployed Application

- Frontend: https://stockpilot-2te0.onrender.com
- Backend: https://stockpilot-api-qgau.onrender.com

## GitHub Repository

- Repository: https://github.com/primouomo123/StockPilot.git

## Notes

- Run migrations before seeding a fresh database.
- The frontend expects the backend API URL through `VITE_API_ENDPOINT`.

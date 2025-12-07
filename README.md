


# Vehicle-Rental-System

**Live API Base URL:**
`https://vehicle-rental-api-psi.vercel.app`

A role-based vehicle rental platform supporting user authentication, fleet management, and booking operations with real-time availability tracking and automated price calculation.

---

## Features

### Authentication & Authorization

* Secure JWT-based login and access control.
* Role-based permissions: **admin** and **customer**.
* Protected routes using bearer tokens.

### Vehicle Management

* Admins can create, update, and delete vehicles.
* Public listing and detail retrieval.
* Automatic availability changes on booking and return.

### User Management

* Admin access to full user list.
* Profile updates for customers and admins.
* Restrictions preventing deletion of users with active bookings.

### Booking Management

* Booking creation with automated rental price calculation.
* Status transitions: active → cancelled/returned.
* Admins see all bookings; customers see only their own.
* Vehicle availability restored after returns or cancellations.

### API Architecture

* RESTful design with consistent response formats.
* Standard HTTP codes and structured error handling.
* Clear business rules around rent duration and pricing.

---

## Technology Stack

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM (if used)
* JWT Authentication
* BCrypt Password Hashing
* Vercel Deployment

---

## API Routes Overview

### Authentication (Public)

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| POST   | `/api/v1/auth/signup` | Register a new user         |
| POST   | `/api/v1/auth/signin` | Login and receive JWT token |

---

### Vehicles

| Method | Endpoint                      | Access | Description          |
| ------ | ----------------------------- | ------ | -------------------- |
| POST   | `/api/v1/vehicles`            | Admin  | Create a new vehicle |
| GET    | `/api/v1/vehicles`            | Public | Get all vehicles     |
| GET    | `/api/v1/vehicles/:vehicleId` | Public | Get vehicle details  |
| PUT    | `/api/v1/vehicles/:vehicleId` | Admin  | Update a vehicle     |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin  | Delete a vehicle     |

---

### Users

| Method | Endpoint                | Access           | Description        |
| ------ | ----------------------- | ---------------- | ------------------ |
| GET    | `/api/v1/users`         | Admin            | Retrieve all users |
| PUT    | `/api/v1/users/:userId` | Admin / Customer | Update user        |
| DELETE | `/api/v1/users/:userId` | Admin            | Delete a user      |

---

### Bookings

| Method | Endpoint                      | Access           | Description                    |
| ------ | ----------------------------- | ---------------- | ------------------------------ |
| POST   | `/api/v1/bookings`            | Customer / Admin | Create booking                 |
| GET    | `/api/v1/bookings`            | Customer / Admin | Retrieve bookings (role-based) |
| PUT    | `/api/v1/bookings/:bookingId` | Customer / Admin | Update booking status          |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Vehicle-Rental-System.git
cd Vehicle-Rental-System
```

### 2. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```



### 5. Start development server

```bash
npm run dev
```

The API will run at:
`http://localhost:5000`

---

## Usage Instructions

* All protected routes require:

  ```
  Authorization: Bearer <jwt_token>
  ```

* Use tools such as **Postman** or **Insomnia** to test routes.

* The live API is available at:
  `https://vehicle-rental-api-psi.vercel.app`




# FacilioCampus - Smart Campus Operations Hub

A full stack web platform for managing campus facility/asset bookings and maintenance ticketing.

**Live demo:** https://smartcampusfaciliocampus.vercel.app/

## Overview

Universities run booking and maintenance requests through scattered emails and paper forms. FacilioCampus replaces that with a single platform where students and staff can book rooms, labs, and equipment, and report and track maintenance issues, all with role-based dashboards and full auditability.

## Features

- **Facilities & Assets Catalogue** - searchable catalogue of bookable resources (lecture halls, labs, meeting rooms, equipment) with type, capacity, location, availability windows, and status (ACTIVE / OUT_OF_SERVICE).
- **Booking Management** - multi-step booking wizard with date/time/purpose/attendee details, real-time conflict checking to prevent double-booking, a PENDING → APPROVED/REJECTED → CANCELLED workflow, conditional PDF-approval upload for auditorium bookings, manager-side booking analytics, and a QR-code check-in flow for approved bookings.
- **Maintenance & Incident Ticketing** - ticket creation with category, priority, and up to 3 image attachments; OPEN → IN_PROGRESS → RESOLVED → CLOSED workflow (plus REJECTED); technician assignment and resolution notes; an SLA calculator that predicts resolution times; comments with ownership rules.
- **Notifications** -  in-app notifications for booking decisions, ticket status changes, and new comments, surfaced across every dashboard.
- **Authentication & Authorization** -  Google OAuth2 login, JWT-based sessions, and role-based access control (USER / ADMIN, plus TECHNICIAN and MANAGER).
- **Role-Based Dashboards** -  dedicated views for Students, Managers, Technicians, and Admins.

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Java 24, Spring Boot, Spring Security (OAuth2 / JWT), Spring Data JPA |
| Database | PostgreSQL (hosted on Neon) |
| Frontend | React (Vite), Tailwind CSS, React Router, Lucide Icons |
| Testing | JUnit, Postman |
| CI/CD | GitHub Actions |

## Architecture

- **Backend:** layered architecture (controller → service → repository), DTO-based validation, centralized exception handling, and role -based endpoint security.
- **Frontend:** component -based React app with protected routes per role, consuming the REST API over HTTPS.
- **Database:** relational schema in PostgreSQL, covering resources, bookings, tickets, comments, notifications, and users/roles.

## Getting Started

### Prerequisites

- Java 24 (JDK)
- Maven (or the Maven wrapper included in the backend folder)
- Node.js 18+ and npm
- A PostgreSQL database (e.g. a free Neon project) or local PostgreSQL instance
- A Google OAuth2 Client ID and Secret ([console.cloud.google.com](https://console.cloud.google.com))

### Backend Setup

```bash
cd backend
```

Create an `application.properties` (or `.env`, depending on your config approach) with:

```properties
spring.datasource.url=jdbc:postgresql://<your-neon-host>/<db-name>
spring.datasource.username=<your-db-user>
spring.datasource.password=<your-db-password>

spring.security.oauth2.client.registration.google.client-id=<your-google-client-id>
spring.security.oauth2.client.registration.google.client-secret=<your-google-client-secret>

jwt.secret=<your-jwt-secret>
jwt.expiration-ms=86400000
```

Run the API:

```bash
./mvnw spring-boot:run
```

The API will start on `http://localhost:8080` by default.

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

Run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## Testing

- Backend unit/integration tests: `./mvnw test`
- API testing: see the Postman collection in `/docs/postman_collection.json`

## CI/CD

GitHub Actions runs build and test on every push/PR - see `.github/workflows/`.

## Academic Note

This project was built as part of IT3030 (Programming Applications and Frameworks), Faculty of Computing, SLIIT - Smart Campus Operations Hub coursework, 2026 Semester 1.

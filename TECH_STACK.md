# 🏗️ Smart Campus Operations Hub - Technology Stack & Architecture

This document provides a clear explanation of our project's technology stack. It is intended to help all group members understand what tools we are using, why we are using them, and how the different pieces of our application connect to each other.

---

## 1. Frontend: The User Interface (Client)
Working Directory: `/frontend`

We are building a **Single Page Application (SPA)** that runs in the user's browser. It is responsible for displaying data and handling user interactions (forms, buttons, navigation).

*   **Framework: React (via Vite)**
    *   *Why:* React is the industry standard for building dynamic, modern web UI. We used Vite instead of Create-React-App because Vite is significantly faster at starting up and building our code during development.
*   **Routing: React Router** *(To be implemented)*
    *   *Why:* Allows us to navigate between pages (e.g., from the `/dashboard` to the `/bookings` page) without refreshing the browser windows.
*   **HTTP Client: Fetch/Axios**
    *   *Why:* Translates frontend actions into API requests to our backend (e.g., clicking "Book" sends a `POST` request to our Spring Boot server).

---

## 2. Backend: The REST API Server
Working Directory: `/backend`

Our backend is the core "brain" of the application. It handles business logic (like checking for booking conflicts), processes data, and talks to the Database.

*   **Language: Java 17+**
    *   *Why:* Strongly typed, highly scalable, and the standard for enterprise backend systems.
*   **Framework: Spring Boot**
    *   *Why:* It is mandated by our assignment. Spring Boot heavily reduces the boilerplate code needed to build a Java-based REST API. It handles our server hosting (embedded Tomcat) and our endpoints.
*   **Build Tool: Maven (`pom.xml`)**
    *   *Why:* Manages our Java dependencies (so if we need a new library, we just paste it into the `pom.xml`, and Maven downloads it).
*   **Security: Spring Security & OAuth 2.0**
    *   *Why:* We must implement Google Sign-in to authenticate users and define roles (e.g., separating `ADMIN` from `USER` access).

---

## 3. Database & ORM
*   **Database: PostgreSQL (Hosted on Neon)**
    *   *Why:* PostgreSQL is a powerful open-source Relational Database. By hosting it on **Neon**, our database lives in the cloud. This means team members don't have to install PostgreSQL locally on their laptops—everyone is connected to the same live database automatically!
*   **ORM: Spring Data JPA (Hibernate)**
    *   *Why:* Object-Relational Mapping (ORM) allows us to write Java Classes (`@Entity`) instead of raw SQL queries. When we build a `Booking` java class, Hibernate automatically generates the `booking` table inside our Neon PostgreSQL database (`spring.jpa.hibernate.ddl-auto=update`).

---

## 4. DevOps & Tooling
*   **Version Control: Git & GitHub**
    *   *Why:* Required for our group collaboration. GitHub acts as our central repository. Everyone will pull the latest code, create personal branches, and merge their work.
*   **CI/CD: GitHub Actions**
    *   *Why:* Required by the assignment. We will write scripts that command GitHub to automatically test and build our code every time someone makes a push or pull request.
*   **Testing: Postman & JUnit**
    *   *Why:* To ensure our API endpoints work correctly. JUnit will be used for unit testing our Java backend logic, and Postman to manually test requests and responses before the frontend is ready.

---

## Group Folder Structure Explained

We have pre-configured a clean, industry-standard architecture for our files. When you write code, place your files in the following logic folders:

### React (`frontend/src/`)
*   `/components` - For small, reusable pieces of UI (like a `BookingCard` or `Navbar`).
*   `/pages` - For high-level pages (like `Dashboard`).
*   `/services` - For logic that communicates with the Backend.

### Spring Boot (`backend/src/main/java/com/facilio/facilio_campus/`)
*   `/model` - Your Database Entities (e.g. `Booking.java`).
*   `/repository` - Interfaces that talk to the Database.
*   `/service` - Where you put the actual business logic / calculations.
*   `/controller` - Classes that expose the REST API endpoints (e.g. `@GetMapping`).
*   `/dto` - Data Transfer Objects (Formatting JSON payloads).

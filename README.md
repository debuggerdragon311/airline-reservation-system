<div align="center">

<br/>

#  ✈  AEROBOOK

**A concurrent flight reservation platform built for reliability.**

[![Java](https://img.shields.io/badge/Java_25-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_4-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-In_Development-orange?style=flat-square)]()
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](LICENSE)


</div>

---

> **Work in progress.** Repo is freshly set up — architecture is locked, active development starting now. This document reflects the intended design.

---

## What We're Building

AeroBook is a backend-first flight reservation system that tackles real concurrency and state-management problems: race conditions on seat booking, booking lifecycle transitions, overbooking logic, and JWT-secured role-based access — all through a clean REST API.

This is not a CRUD tutorial. It's modelled on how real airline backends are structured.

---

## Planned Features

**Booking Engine**
- Concurrent seat booking with optimistic locking (no double-booking under load)
- Booking lifecycle: `PENDING → CONFIRMED → CHECKED_IN → CANCELLED`
- Overbooking support (~5–10% oversell, configurable per flight)
- Price tiers based on booking window

**Flight Management**
- Search by origin, destination, date, class, and stops
- Flight state machine: `SCHEDULED → BOARDING → DEPARTED → LANDED → CANCELLED`
- Seat map (rows A–F, Economy / Business)

**Auth & Access**
- JWT authentication with refresh token support
- Role-based access: `PASSENGER` and `ADMIN`
- Secure endpoints via Spring Security

---

## Tech Stack

| Layer | Technology                  |
|---|-----------------------------|
| Backend | Java 25, Spring Boot 4      |
| Database | PostgreSQL 16               |
| ORM | Spring Data JPA / Hibernate |
| Auth | Spring Security + JWT       |
| Frontend | React (Vite)                |
| API Docs | Swagger / OpenAPI 4         |
| Build | Maven                       |
| Infrastructure | Docker, Docker Compose      |

---

## Planned API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/flights/search` | Search flights by route and date |
| `POST` | `/auth/register` | Create a passenger account |
| `POST` | `/auth/login` | Authenticate and receive JWT |
| `POST` | `/bookings` | Book a seat on a flight |
| `GET` | `/bookings/{id}` | Retrieve booking details |
| `DELETE` | `/bookings/{id}` | Cancel a booking |
| `PATCH` | `/admin/flights/{id}/status` | Update flight status (admin) |

Full spec will live in [`docs/API.md`](docs/API.md) once scaffolding is done.

---

## Project Structure

```
airline-reservation/
├── backend/
│   └── src/main/java/com/airline/
│       ├── controller/       # REST endpoints
│       ├── service/          # Business logic
│       ├── repository/       # JPA repositories
│       ├── model/            # Entities: Flight, Booking, Passenger, Seat
│       ├── dto/              # Request / Response DTOs
│       └── config/           # Security, Swagger
├── frontend/                 # React (Vite) app
├── docs/
│   ├── ER-diagram.png
│   └── API.md
├── docker-compose.yml
└── README.md
```

---

## Team

| Track | Scope |
|---|---|
| **Backend — Data** | Schema design, JPA entities, seed data, repositories |
| **Backend — API** | Controllers, services, seat locking, auth endpoints |
| **Frontend / Admin** | React booking flow, admin panel, Swagger validation |

---

## Getting Started (once scaffolding is up)

```bash
git clone https://github.com/your-org/airline-reservation-system.git
cd airline-reservation-system
docker-compose up -d
```

Setup instructions will be expanded as the project progresses.

---

## License

Apache 2.0 — see [`LICENSE`](LICENSE) for details.

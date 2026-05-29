# AeroBook — API Reference

> **Base URL:** `http://localhost:8080/api`
> **Version:** v1 &nbsp;|&nbsp; **Auth:** Bearer JWT &nbsp;|&nbsp; **Format:** `application/json`

All timestamps are **UTC ISO-8601** (`2025-06-10T14:30:00Z`).
All IDs are **UUID v7** (time-ordered, generated via Hibernate 7 `@UuidGenerator(style = TIME)`).
Authenticated endpoints require `Authorization: Bearer <token>` header.

---

## Auth

### `POST /auth/register`

Create a new passenger account.

**Auth required:** No

**Request**
```json
{
  "email": "arjun@example.com",
  "password": "Str0ng!Pass",
  "firstName": "Arjun",
  "lastName": "Sharma",
  "phone": "+919876543210"
}
```

**Response `201 Created`**
```json
{
  "id": "a1b2c3d4-...",
  "email": "arjun@example.com",
  "firstName": "Arjun",
  "lastName": "Sharma",
  "role": "PASSENGER",
  "createdAt": "2025-06-10T10:00:00Z"
}
```

**Errors**

| Code | Reason |
|---|---|
| `400` | Validation failure — missing field, invalid email format |
| `409` | Email already registered |

---

### `POST /auth/login`

Authenticate and receive a JWT.

**Auth required:** No

**Request**
```json
{
  "email": "arjun@example.com",
  "password": "Str0ng!Pass"
}
```

**Response `200 OK`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 86400,
  "passenger": {
    "id": "a1b2c3d4-...",
    "email": "arjun@example.com",
    "role": "PASSENGER"
  }
}
```

**Errors**

| Code | Reason |
|---|---|
| `401` | Invalid credentials |

---

## Flights

### `GET /flights/search`

Search for available flights. Returns only flights with `status = SCHEDULED` and at least one available seat.

**Auth required:** No

**Query parameters**

| Param | Type | Required | Example |
|---|---|---|---|
| `from` | `string` | Yes | `DEL` |
| `to` | `string` | Yes | `BOM` |
| `date` | `date` | Yes | `2025-06-10` |
| `class` | `string` | No | `ECONOMY` \| `BUSINESS` |

**Response `200 OK`**
```json
[
  {
    "id": "f1e2d3c4-...",
    "flightNumber": "AB-101",
    "origin": "DEL",
    "destination": "BOM",
    "departureTime": "2025-06-10T06:00:00Z",
    "arrivalTime": "2025-06-10T08:10:00Z",
    "availableSeats": 42,
    "basePrice": 4500.00,
    "status": "SCHEDULED"
  }
]
```

Returns empty array `[]` — not `404` — when no flights match.

---

### `GET /flights/{id}/seats`

List all seats for a flight with availability.

**Auth required:** No

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | `UUID v7` | Flight ID |

**Response `200 OK`**
```json
[
  {
    "id": "s1a2b3c4-...",
    "seatNumber": "12A",
    "class": "ECONOMY",
    "isAvailable": true,
    "price": 4500.00
  },
  {
    "id": "s2b3c4d5-...",
    "seatNumber": "2B",
    "class": "BUSINESS",
    "isAvailable": false,
    "price": 12000.00
  }
]
```

**Errors**

| Code | Reason |
|---|---|
| `404` | Flight not found |

---

## Bookings

### `POST /bookings`

Book a seat on a flight. Acquires an optimistic lock on the seat. If the seat was taken between search and booking, returns `409`.

**Auth required:** Yes — `PASSENGER`

**Request**
```json
{
  "flightId": "f1e2d3c4-...",
  "seatId": "s1a2b3c4-..."
}
```

**Response `201 Created`**
```json
{
  "id": "b1c2d3e4-...",
  "flightId": "f1e2d3c4-...",
  "seatId": "s1a2b3c4-...",
  "seatNumber": "12A",
  "class": "ECONOMY",
  "status": "CONFIRMED",
  "bookedAt": "2025-06-01T11:22:33Z",
  "totalPrice": 4500.00,
  "passenger": {
    "id": "a1b2c3d4-...",
    "firstName": "Arjun",
    "lastName": "Sharma"
  },
  "flight": {
    "flightNumber": "AB-101",
    "origin": "DEL",
    "destination": "BOM",
    "departureTime": "2025-06-10T06:00:00Z"
  }
}
```

**Errors**

| Code | Reason |
|---|---|
| `400` | Missing or invalid fields |
| `404` | Flight or seat not found |
| `409` | Seat already booked — retry with a different seat |
| `422` | Flight is not in `SCHEDULED` status |

---

### `GET /bookings/{id}`

Retrieve a booking. Passengers can only fetch their own bookings. Admins can fetch any.

**Auth required:** Yes — `PASSENGER` (own) or `ADMIN`

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | `UUID v7` | Booking ID |

**Response `200 OK`**

Same shape as `POST /bookings` response.

**Errors**

| Code | Reason |
|---|---|
| `403` | Passenger attempting to access another passenger's booking |
| `404` | Booking not found |

---

### `DELETE /bookings/{id}`

Cancel a booking. Sets `booking.status = CANCELLED` and flips `seat.is_available = true`. Only allowed if flight has not yet departed.

**Auth required:** Yes — `PASSENGER` (own) or `ADMIN`

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | `UUID v7` | Booking ID |

**Request body (optional)**
```json
{
  "reason": "Change of plans"
}
```

**Response `200 OK`**
```json
{
  "id": "b1c2d3e4-...",
  "status": "CANCELLED",
  "cancellationReason": "Change of plans"
}
```

**Errors**

| Code | Reason |
|---|---|
| `403` | Not the booking owner or not admin |
| `404` | Booking not found |
| `422` | Flight already departed — cancellation not permitted |

---

## Admin

> All `/admin/**` endpoints require `role = ADMIN`. A `PASSENGER` JWT returns `403`.

### `GET /admin/flights`

List all flights regardless of status.

**Auth required:** Yes — `ADMIN`

**Query parameters (all optional)**

| Param | Type | Example |
|---|---|---|
| `status` | `string` | `SCHEDULED` |
| `origin` | `string` | `DEL` |
| `destination` | `string` | `BOM` |

**Response `200 OK`**

Array of flight objects (same shape as search results, plus `totalBookings` count).

---

### `POST /admin/flights`

Create a new flight and auto-generate its seat rows.

**Auth required:** Yes — `ADMIN`

**Request**
```json
{
  "flightNumber": "AB-202",
  "origin": "CCU",
  "destination": "DEL",
  "departureTime": "2025-07-01T08:00:00Z",
  "arrivalTime": "2025-07-01T10:30:00Z",
  "economySeats": 120,
  "businessSeats": 20,
  "basePrice": 3800.00
}
```

**Response `201 Created`**

Full flight object with `id` and `totalSeats`.

**Errors**

| Code | Reason |
|---|---|
| `400` | Validation failure — arrival before departure, invalid IATA code |
| `409` | `flightNumber` already exists |

---

### `PATCH /admin/flights/{id}/status`

Advance or cancel a flight's status.

**Auth required:** Yes — `ADMIN`

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | `UUID v7` | Flight ID |

**Request**
```json
{
  "status": "BOARDING"
}
```

**Valid transitions**

| From | To |
|---|---|
| `SCHEDULED` | `BOARDING`, `CANCELLED` |
| `BOARDING` | `DEPARTED` |
| `DEPARTED` | `LANDED` |
| `LANDED` | — none — |
| `CANCELLED` | — none — |

**Response `200 OK`**
```json
{
  "id": "f1e2d3c4-...",
  "flightNumber": "AB-101",
  "status": "BOARDING"
}
```

**Errors**

| Code | Reason |
|---|---|
| `404` | Flight not found |
| `422` | Invalid status transition |

---

## Error envelope

All error responses follow this shape:

```json
{
  "timestamp": "2025-06-10T11:22:33Z",
  "status": 409,
  "error": "Conflict",
  "message": "Seat s1a2b3c4 is no longer available",
  "path": "/api/bookings"
}
```

---

## HTTP status codes used

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad request — validation error |
| `401` | Unauthenticated |
| `403` | Forbidden — authenticated but not authorised |
| `404` | Resource not found |
| `409` | Conflict — duplicate or race condition |
| `422` | Unprocessable — request valid but business rule violated |
{NEEDED DISCUSSION}

POST   /api/auth/register
POST   /api/auth/login

GET    /api/flights/search?from=DEL&to=BOM&date=2025-06-10
GET    /api/flights/{id}/seats

POST   /api/bookings
GET    /api/bookings/{id}
DELETE /api/bookings/{id}

GET    /api/admin/flights        (admin only)
POST   /api/admin/flights        (admin only)
PATCH  /api/admin/flights/{id}/status

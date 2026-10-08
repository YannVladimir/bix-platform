# bix-platform

Full-stack inventory & sales management platform — a Spring Boot (Java) backend with JWT auth, product/stock/sales/approval modules, and a React + Vite + Tailwind frontend.

## Structure

- `backend/` — Spring Boot API (Java, Maven, PostgreSQL, Spring Security + JWT)
- `frontend/` — React app (Vite, Tailwind)

## Backend setup

Set required environment variables before running (see `backend/src/main/resources/application.properties.example`):

```
DB_URL=jdbc:postgresql://localhost:5432/bix
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=<generate your own, e.g. `openssl rand -hex 32`>
```

Then:

```
cd backend
./mvnw spring-boot:run
```

## Frontend setup

```
cd frontend
npm install
npm run dev
```

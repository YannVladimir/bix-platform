# bix-platform

Full-stack, multi-tenant inventory & sales management platform for small
businesses. Companies (tenants) manage products, categories, stock and
sales, with an employee-approval workflow for sensitive changes and a
super-admin console for managing companies and users across the whole
platform.

## Tech stack

- **Backend**: Java 21, Spring Boot 4, Spring Security (JWT, stateless), Spring Data JPA, PostgreSQL, Maven
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Framer Motion
- **Auth**: JWT bearer tokens, BCrypt password hashing, role-based access (`SUPER_ADMIN`, `MANAGER`, `EMPLOYEE`)

## Structure

```
backend/   Spring Boot API (Java, Maven, PostgreSQL, Spring Security + JWT)
frontend/  React app (Vite, Tailwind)
```

Backend modules: `auth` (login/register/JWT), `company`, `user`, `product`
(+ `category`), `stock`, `sales`, `approval` (manager approval queue for
employee-submitted changes).

## Backend setup

The backend needs a running PostgreSQL instance and a handful of environment
variables — see `backend/src/main/resources/application.properties.example`
for the full list with explanations:

```
DB_URL=jdbc:postgresql://localhost:5432/bix
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=<generate your own, e.g. `openssl rand -hex 32`>

# Optional: bootstraps a SUPER_ADMIN account on startup if both are set.
# Without these, no admin account is created automatically - either seed
# one directly in the database or register a company (which creates a
# MANAGER account) and promote it manually.
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=<a strong password - never commit this>
```

Then:

```
cd backend
./mvnw spring-boot:run
```

The API listens on `http://localhost:8080`. Uploaded images are written to
`backend/uploads/` (gitignored) and served from `/uploads/**`.

### Running the backend tests

```
cd backend
./mvnw test
```

Tests run against an in-memory H2 database (configured in
`backend/src/test/resources/application.properties`), so no live Postgres
instance or real secrets are required locally or in CI.

## Frontend setup

```
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and expects the backend at
`http://localhost:8080` (see `frontend/src/api/axios.js`).

### Linting and building the frontend

```
cd frontend
npm run lint
npm run build
```

## Continuous Integration

`.github/workflows/ci.yml` runs on every push and pull request:

- **backend**: `mvn test` (Java 21) against the in-memory H2 database
- **frontend**: `npm ci`, `npm run lint`, `npm run build` (Node 20)

## Security notes

- Secrets (DB credentials, `JWT_SECRET`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`) are
  read from environment variables only - never commit real values. Copy
  `backend/src/main/resources/application.properties.example` as a reference
  for what to set.
- The initial SUPER_ADMIN account is only created when `ADMIN_EMAIL` and
  `ADMIN_PASSWORD` are both explicitly provided; nothing is seeded with a
  hardcoded login.

## License

MIT - see [LICENSE](LICENSE).

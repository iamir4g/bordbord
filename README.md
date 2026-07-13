# BoardGameGeek Clone (Next.js + Strapi)

## Structure

- frontend: Next.js (App Router) + TypeScript + Tailwind
- backend: Strapi + PostgreSQL

## Prereqs

- Docker + Docker Compose

## Run

1. From the repository root:

   ```bash
   docker compose up --build
   ```

2. Open:
   - Frontend: http://localhost:3000
   - Strapi Admin: http://localhost:1337/admin

On first run, create the Strapi admin user in the browser.

## Environment

- Root: .env (ports + Postgres defaults used by Compose)
- Backend: backend/.env (Strapi + database connection)
- Frontend: frontend/.env (Strapi API URLs)

## Notes

- Strapi permissions: to read content from the frontend without auth, enable Public permissions for the relevant collection types in Strapi Admin → Settings → Users & Permissions Plugin → Roles → Public.

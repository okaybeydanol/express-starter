# Express.js Feature-Based Starter Template

A feature-based, functional programming oriented Express.js starter template with TypeScript, Prisma ORM, and PostgreSQL.

## Features

- 🏗️ Feature-based architecture (not layer-based)
- 🧩 Functional programming paradigms
- 🔒 JWT authentication and authorization
- 🔍 TypeScript with strict typing
- 📊 Prisma ORM with PostgreSQL
- 🧪 Testing with Vitest
- 📝 Logging with Winston
- 🛡️ Security middleware (helmet, cors, rate-limiting)
- 🔄 Git hooks with Husky and lint-staged
- 📏 ESLint and Prettier configuration
- 📦 Module aliasing for clean imports

## Prerequisites

- Node.js (v18+)
- PostgreSQL
- yarn (recommended) or npm/pnpm

## Getting Started

1. Clone this repository
2. Install dependencies: `yarn install`
3. Copy `.env.example` to `.env` and update the values
4. Run database migrations: `yarn prisma:migrate:dev`
5. Start development server: `yarn dev`

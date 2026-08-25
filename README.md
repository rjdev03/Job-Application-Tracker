# Job Tracker

A modern, full-stack Kanban style dashboard designed to manage, organize, and track your job application journey in one centralized workspace.

## Features

- **Kanban Board Interface:** Drag-and-drop or status-toggle mechanics to seamlessly move jobs through various phases (Wishlist, Applied, Interviewing, Offer, Rejected).

- **Comprehensive Job Cards:** Store company names, salaries, roles, descriptions, URLs, and specific interview notes in organized cards.

- **Secure User Authentication:** Powered by a robust backend auth structure to protect personal search metrics and user data.

- **Built for Speed:** Optimized routing and server-side utilities leveraging the Next.js App Router framework. 

## Tech Stack

- **Framework:** Next.js (App Router v16)

- **Language:** TypeScript

- **Styling:** Tailwind CSS / shadcn/ui components

- **Authentication:** BetterAuth

- **Package Manager:** pnpm

- **Database:** MongoDB (with Mongoose models)

## Repository Structure

```text

├── app/ # Next.js App Router (Pages, API routes, Layouts)

├── components/ # Reusable Shadcn/UI and custom application layout pieces

├── lib/ # Database utility, helper hooks, authentication, and core configurations

│ ├── actions/ # Server actions handling data mutation

│ ├── auth/ # Client and server authentication workflows

│ └── models/ # Mongoose schemas (Boards, Columns, Applications)

├── public/ # Static assets and application hero imagery

├── scripts/ # Database seeding and configuration scripts

└── pnpm-workspace.yaml # Workspace management settings

```

## Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io) installed on your machine.

### 2. Installation

Clone the repository locally and install the dependencies:

```bash

git clone https://github.com/rjdev03/Job-Application-Tracker.git

cd Job-Application-Tracker

pnpm install

```

### 3. Environment Setup

Create a `.env.local` file in the root directory and append your required environment keys (Database URLs, Auth Keys):

```env

DATABASE_URL=your_mongodb_connection_string

AUTH_SECRET=your_secure_auth_secret_key

```

*(Note: `.env.local` is intentionally kept hidden by the `.gitignore` configuration for credential isolation).*

### 4. Run the Development Server

Execute the application environment:

```bash

pnpm dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard locally.
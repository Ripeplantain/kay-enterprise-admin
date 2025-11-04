# Kay Enterprise Admin Dashboard

This is the administration dashboard for Kay Enterprise, a bus transportation company. It provides a centralized interface for managing all aspects of the business operations.

## Project Scope & Features

This is a comprehensive admin panel designed to manage a bus transportation service. The key features include:

*   **Dashboard:** A central hub displaying key statistics and recent activities.
*   **Trip & Route Planning:** Define bus routes and schedule trips.
*   **Fleet Management:** Add and manage the company's fleet of buses.
*   **Client Management:** Keep track of customer information.
*   **Agent Management:** Manage travel agents, including an approval/rejection workflow.
*   **Luggage Tracking:** Manage and track passenger luggage.
*   **Payment Monitoring:** Oversee and manage payments (future implementation).
*   **Authentication:** Secure login for administrators.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (based on `components.json`)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project is organized using the Next.js App Router structure:

*   `app/(root)/`: Contains the main pages of the application, protected by authentication.
*   `app/(auth)/`: Contains the public-facing authentication pages (e.g., login).
*   `app/api/`: Handles API routes, including NextAuth.js authentication.
*   `components/`: Contains reusable React components, organized by feature and UI elements.
*   `services/`: Contains functions for interacting with backend APIs.
*   `lib/`: Contains utility functions, type definitions, and validation logic.
*   `hooks/`: Contains custom React hooks.
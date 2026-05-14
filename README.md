# Moneymaze Frontend

Moneymaze is a modern, comprehensive personal finance management application designed to help users track expenses, manage budgets, and analyze their spending habits. This repository contains the frontend application built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🔐 Authentication & Security
- **Secure Login & Registration**: Email/password authentication with JWT.
- **Token Management**: Automatic token refresh using HTTP-only cookies.
- **Password Recovery**: Forgot password flow with email verification codes.
- **Profile Management**: Update user profile and avatar.
- **Settings**: Customizable preferences (currency, budget start day, etc.) with a "Reset to Defaults" option.

### 📊 Dashboard
- **Overview**: At-a-glance view of total balance, monthly spendings, and budget health.
- **Recent Transactions**: Quick access to the latest expenses.
- **Budget Health**: Visual indicators (Good, Warning, Over Budget) for current budget periods.
- **Statistics**: Interactive charts using `recharts` to visualize spending trends and category breakdowns.

### 💸 Expense Management
- **CRUD Operations**: Create, read, update, and delete expenses.
- **Filtering**: Filter expenses by date range, category, and more.
- **Receipts**: Upload and view receipt images.

### 💰 Budgeting
- **Budget Templates**: Define recurring monthly budgets for specific categories.
- **Budget Periods**: Track actual spending against budgets for specific months.
- **History**: View past budget performance with a convenient month picker.
- **Smart Alerts**: Visual warnings when spending approaches defined thresholds.

### 📅 Subscriptions
- **Subscription Tracking**: Manage recurring subscriptions (Netflix, Spotify, etc.).
- **Reminders**: (Planned) Get notified before upcoming payments.

## 🛠️ Tech Stack

- **Core**: [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Date Handling**: [date-fns](https://date-fns.org/), [react-datepicker](https://reactdatepicker.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Backend server running (typically on port 9000)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd moneymaze-frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory (or copy `.env.example` if available):
    ```env
    VITE_API_BASE_URL=http://localhost:9000/api/v1
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000` (or the port shown in your terminal).

## 📂 Project Structure

```
src/
├── assets/             # Static assets (images, fonts)
├── components/         # Reusable UI components
│   ├── common/         # Generic components (Buttons, Modals, Inputs)
│   ├── features/       # Feature-specific components (Dashboard, Budgets)
│   └── layout/         # Layout components (Sidebar, Header)
├── config/             # Configuration files (API endpoints)
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts (AuthLayout, MainLayout)
├── pages/              # Page components (routed)
├── services/           # API service layers
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the ISC License.

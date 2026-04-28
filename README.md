# DietPadi - Diet Management Platform

A comprehensive web application for dietitians and healthcare providers to manage clients, diet plans, prescriptions, and appointments. Built with modern web technologies for a seamless user experience.

## 🚀 Features

### For Healthcare Providers

- **Client Management**: View and manage client profiles, health information, and progress tracking
- **Diet Plan Creation**: Design personalized meal plans with weekly schedules and nutritional goals
- **Prescription Management**: Create, edit, and track medication prescriptions with dosage and frequency
- **Appointment Scheduling**: Manage appointments and calendar integration
- **Provider Dashboard**: Overview of clients, appointments, and performance metrics

### For Administrators

- **Provider Management**: Add, edit, suspend, or remove healthcare providers
- **System Administration**: Manage user roles, permissions, and system settings
- **Analytics Dashboard**: View platform usage statistics and provider performance
- **Subscription Management**: Handle billing and subscription plans

### Core Features

- **Real-time Data**: Live updates using Supabase real-time subscriptions
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Theme**: User preference for theme switching
- **Multi-role Authentication**: Support for super admins, admins, and providers
- **Secure Authentication**: Supabase Auth with role-based access control
- **Data Export**: CSV export functionality for reports and backups

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Supabase Auth** - User authentication and authorization
- **Supabase Storage** - File storage for avatars and documents
- **Supabase Edge Functions** - Serverless functions for complex operations

### Development Tools

- **ESLint** - Code linting and formatting
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **TypeScript** - Type checking
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ProvidersGridView.tsx
│   ├── ProvidersListView.tsx
│   └── provider-utils.ts
├── contexts/           # React contexts for global state
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom React hooks
│   ├── useProviders.ts
│   └── use-toast.ts
├── integrations/       # External service integrations
│   └── supabase/
├── modals/             # Modal components for forms and dialogs
├── pages/              # Page components and routes
├── lib/                # Utility functions and configurations
└── test/               # Test files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Diet-Pady/dietpadi_web.git
   cd dietpadi_web
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

### Run E2E Tests

```bash
npx playwright test
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

## 🔐 Authentication & Roles

The application supports three user roles:

1. **Super Admin** - Full system access, manage admins and providers
2. **Admin** - Manage providers and system settings
3. **Provider** - Manage clients, diet plans, and prescriptions

## 📊 Database Schema

The application uses Supabase with the following main tables:

- `profiles` - User profiles with role information
- `user_roles` - User role assignments
- `clients` - Client information
- `diet_plans` - Diet plan data
- `prescriptions` - Prescription records
- `appointments` - Appointment scheduling

## 🎨 UI/UX Design

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant components using Radix UI
- **Dark Mode**: System preference detection with manual toggle
- **Consistent Theming**: Design system with CSS variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ for healthcare professionals
# diet-padi-web

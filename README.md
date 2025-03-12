# 📊 Habit Tracker Next.js Dashboard

## 📑 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Key Components](#key-components)
- [AI Integration](#ai-integration)
- [Charts & Visualization](#charts--visualization)
- [PWA Implementation](#pwa-implementation)
- [Notifications](#notifications)
- [Authentication](#authentication)
- [Development Guidelines](#development-guidelines)

## 🌟 Overview

Habit Tracker is a modern web application built with Next.js 15 and TypeScript that helps users track, analyze, and improve their daily habits. The application combines powerful visualization tools with AI-driven insights to provide personalized recommendations for habit formation and maintenance.

## ✨ Features

- 🔐 Secure user authentication
- ➕ Habit creation, tracking, and management
- 📱 Responsive design with PWA support for mobile usage
- 🔔 Push notifications for habit reminders
- 📊 Interactive charts to visualize progress (daily, weekly, monthly, yearly)
- 🤖 AI-powered habit analysis and personalized suggestions
- 📈 Predictive modeling to forecast habit formation trends
- 🌙 Dark/light mode support

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm

### Setup
1. Clone the repository:
```
git clone https://github.com/davariijs/Habit-Tracker-Website-Next.js-TypeScript.git
```

2. Install dependencies:
```
pnpm install
```

3. Create `.env.local` file based on `.env.example.txt`:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
```

4. Run the development server:
```
pnpm dev
```

5. Build for production:
```
pnpm build
```

## 🧩 Key Components

### Habit Management
- **Habits Page in Dashboard**: Display individual habits with progress indicators
- **HabitForm**: Create and edit habits with customizable parameters
- **HabitList**: Show all habits with sorting and filtering options
- **HabitDetail**: Detailed view of a specific habit with analytics and charts

### Notification System
- **ReminderSettings**: Customize reminder times and frequency
- **PushNotification**: Service for sending push notifications

## 🤖 AI Integration

The application uses TensorFlow.js and Google's Generative AI to:

1. **Habit Analysis**: Process user habit data to identify patterns and trends
2. **Pattern Recognition**: Identify correlations between different habits
3. **Suggestion Engine**: Generate personalized recommendations based on:
   - User's past behavior
   - Scientific research on habit formation
4. **Predictive Models**: Forecast habit completion probability and suggest optimal timing


## 📊 Charts & Visualization

The application uses Recharts to provide comprehensive habit tracking visualization:

1. **Daily View**: Hour-by-hour habit completion
2. **Weekly View**: Day-by-day progress with streak indicators
3. **Monthly View**: Calendar heatmap showing consistency
4. **Yearly View**: Long-term trends and patterns

Charts are responsive and support both light and dark themes with consistent color schemes for better data interpretation.

Key components:
- `components/chartsProgress/`

## 📱 PWA Implementation

The application uses `next-pwa` to provide a full Progressive Web App experience:

1. **Offline Support**: Core functionality works without internet
2. **Install Prompt**: Users can add the app to their home screen
3. **Service Worker**: Background sync and push notification support
4. **Caching Strategy**: Optimized for fast loading and offline use

Configuration:
- `next.config.js`: PWA configuration
- `sw-register.js`: Service worker registration
- `sw-custom.js`: Service worker for notifications
- `workbox-4754cb24.js`: Workbox implementation

## 🔔 Notifications

Habit Tracker implements a comprehensive notification system using web-push:

1. **Push Notifications**: Browser and mobile notifications
2. **Custom Schedules**: Set specific times for habit reminders


## 🔐 Authentication

Authentication is handled via Next Auth with:

1. **Social Login**: GitHub & Google OAuth integration
2. **Credential Auth**: Email/password authentication
3. **Session Management**: Secure session handling
4. **Protected Routes**: Middleware for route protection

## 👨‍💻 Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write clean, self-documenting code

### State Management
- Zustand for global state
- React Query for server state
- Context API for theme and authentication

### Performance Considerations
- Implement code splitting
- Optimize bundle size
- Use Next.js Image component for optimized images
- Implement proper caching strategies

### Accessibility
- Ensure all components are keyboard navigable
- Proper ARIA attributes
- Color contrast compliance
- Screen reader compatibility

---
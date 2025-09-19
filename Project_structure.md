# CemAI UI Project Structure

This document outlines the directory and file structure for the `cemai-ui` frontend application. The project is built with **React** and **Vite**, using **shadcn/ui** for components and **Tailwind CSS** for styling. This structure is designed for clarity, scalability, and ease of maintenance.

## Root Directory

The root directory contains configuration files for Vite, PostCSS, Tailwind CSS, TypeScript, and general project settings.

```
/
├── public/                # Static assets (favicon, logos)
├── src/                   # Main application source code
├── .eslintrc.js           # ESLint configuration
├── .gitignore             # Git ignore file
├── index.html             # Main HTML entry point for Vite
├── package.json           # Project dependencies and scripts
├── tsconfig.app.json      # TypeScript configuration for app
├── tsconfig.json          # TypeScript base configuration
├── tsconfig.node.json     # TypeScript configuration for Node
└── vite.config.ts         # Vite build tool configuration
```

---

## `src` Directory

The `src` directory contains all the React application source code, organized by feature and function.

```
src/
├── api/                   # API call handlers and configuration
├── assets/                # Static assets like images, fonts
├── components/            # Reusable UI components
├── config/                # Application-level configuration
├── features/              # Feature-specific components and logic
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── pages/                 # Top-level page components
├── services/              # Business logic and state management
├── types/                 # TypeScript type definitions
├── App.tsx                # Root React component
├── main.tsx               # Application entry point
├── App.css                # Component-specific styles
└── index.css              # Global styles
```

### Detailed Breakdown of `src` Subdirectories

#### `/src/api`

Handles all communication with the backend CemAI Agent Swarm. This centralizes API logic, making it easier to manage endpoints and data fetching.

-   **`agentService.ts`**: Contains functions for interacting with the Master Control Agent's API (e.g., `getAgentState`, `postOperatorDecision`).
-   **`axiosClient.ts`**: A pre-configured Axios instance with base URL, headers, and error handling for all API requests.
-   **`types.ts`**: TypeScript interfaces for API request/response types.

#### `/src/assets`

Stores static assets that are imported into the application, such as logos or custom icons.

#### `/src/components`

Contains all UI components. Following the `shadcn/ui` convention, this directory is split into `ui` (generated, unstyled primitives) and `shared` (custom-built, composed components).

-   **/ui/**: This is where `shadcn/ui` components are scaffolded (e.g., `button.tsx`, `card.tsx`, `dialog.tsx`). You typically don't edit these files directly, but rather compose them in your shared components.
-   **/shared/**: Your custom, reusable components built from the `ui` primitives and other React elements.
    -   `Header.tsx`: The main application header.
    -   `AgentStatusIndicator.tsx`: A component to show an agent's current state (e.g., ✅ Stable, 💡 Analyzing).
    -   `MasterControlLog.tsx`: The component to display the real-time log of agent decisions.
    -   `KpiCard.tsx`: A reusable card to display a single Key Performance Indicator.

#### `/src/config`

Stores application-wide configuration and constants.

-   **`constants.ts`**: Application constants, such as API endpoint URLs, polling intervals, etc.
-   **`env.ts`**: Environment configuration with type safety.

#### `/src/features`

Feature-specific components and logic, organized by the three main epics from the PRD.

-   **/glass-cockpit/**: Components for real-time situational awareness
    -   `KpiDashboard.tsx`: Main KPI dashboard component
    -   `PredictiveHealthGlyphs.tsx`: Zero-cognition status indicators
    -   `PyroProcessWidget.tsx`: Pyro-process stability visualization
-   **/co-pilot/**: Human-AI collaboration components
    -   `AutonomyControl.tsx`: Main autonomy control button
    -   `DecisionHub.tsx`: Decision review modal
    -   `DecisionHistory.tsx`: Audit trail component
-   **/oracle/**: AI assistant components
    -   `ChatInterface.tsx`: Main chat component
    -   `ContextualSuggestions.tsx`: Proactive assistance
    -   `SopIntegration.tsx`: Standard Operating Procedures

#### `/src/hooks`

Custom React hooks to encapsulate and reuse stateful logic.

-   **`useAgentState.ts`**: A hook that periodically polls the backend for the latest agent swarm status and provides the data to components.
-   **`useAuth.ts`**: A hook for handling user authentication logic.
-   **`useWebSocket.ts`**: Hook for managing WebSocket connections.
-   **`useRealTimeData.ts`**: Hook for real-time data streaming.

#### `/src/lib`

Shared utility functions that are pure and can be used anywhere in the application.

-   **`utils.ts`**: General utility functions, particularly the `cn` function for merging Tailwind CSS classes, as required by `shadcn/ui`.
-   **`formatters.ts`**: Functions for formatting data, like dates or numbers.
-   **`validation.ts`**: Form validation schemas and utilities.

#### `/src/pages`

Contains the main page components that represent different views or routes in the application.

-   **`DashboardPage.tsx`**: The main "Control Tower" view. This component will compose various shared components (`Header`, `MasterControlLog`, `KpiCard`, etc.) to build the complete UI.
-   **`LoginPage.tsx`**: Authentication page.
-   **`SettingsPage.tsx`**: User preferences and configuration.

#### `/src/services`

Manages global state and complex business logic. This is where you might use a state management library like Zustand.

-   **`agentStore.ts`**: Zustand store that holds the global state of the agent swarm, fetched by the `useAgentState` hook.
-   **`uiStore.ts`**: UI state management for modals, notifications, etc.
-   **`authStore.ts`**: Authentication state and user session management.

#### `/src/types`

TypeScript type definitions organized by domain.

-   **`agent.ts`**: Types for agent swarm data structures.
-   **`kpi.ts`**: Types for KPI data and metrics.
-   **`user.ts`**: User and authentication types.
-   **`api.ts`**: Common API response types.

## Component Architecture

### Component Hierarchy:
```
App
├── AuthProvider
├── ThemeProvider
├── ErrorBoundary
├── Router
    ├── DashboardPage
    │   ├── Header (with AutonomyControl)
    │   ├── KpiGrid
    │   │   └── KpiCard (x4 for each metric)
    │   ├── ProcessStabilityWidget
    │   │   └── PredictiveHealthGlyphs
    │   ├── MasterControlLog
    │   └── ChatInterface (Oracle)
    ├── DecisionHub (Modal)
    └── DecisionHistory
```

### File Naming Conventions
- **PascalCase** for component files and names (`KpiCard.tsx`)
- **camelCase** for hooks, utilities, and services (`useAgentState.ts`)
- **kebab-case** for non-component files when appropriate
- **index.ts** files for clean exports from directories

## Build and Development Structure

### Development Scripts
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

### Environment Configuration
```
.env.local           # Local development overrides
.env.development     # Development environment
.env.production      # Production environment
```

### Build Output
```
dist/
├── assets/          # Compiled CSS/JS bundles
├── index.html       # Main HTML file
└── vite.svg         # Static assets
```

## TypeScript Configuration

### Module Resolution
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### Strict Type Checking
- `strict: true` for maximum type safety
- `noUncheckedIndexedAccess: true` for array safety
- `exactOptionalPropertyTypes: true` for precise optional properties

## Testing Structure

```
src/
├── __tests__/       # Global test utilities
├── components/
│   └── __tests__/   # Component tests
├── features/
│   └── __tests__/   # Feature tests
└── hooks/
    └── __tests__/   # Hook tests
```

## Performance Considerations

### Code Splitting
- Route-based splitting for pages
- Feature-based splitting for large components
- Dynamic imports for heavy dependencies

### Bundle Analysis
```bash
npm run build -- --analyze
```

### Asset Optimization
- Image optimization with Vite plugins
- SVG component generation
- CSS purging with Tailwind

This structure provides a scalable foundation for the CemAI Control Tower application, ensuring maintainability and developer experience while supporting the complex requirements outlined in the PRD.

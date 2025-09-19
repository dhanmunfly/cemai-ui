# UI/UX Design Document - CemAI Control Tower

## Design System Overview

The CemAI Control Tower follows a **"Dark Operations"** design theme optimized for 24/7 control room environments. The interface prioritizes clarity, reduces eye strain, and builds trust through transparent AI interactions.

## Visual Design Principles

### Color Palette

#### Primary Colors
- **Background:** `#0a0a0a` (Near black for reduced eye strain)
- **Surface:** `#1a1a1a` (Elevated surfaces)
- **Border:** `#2a2a2a` (Subtle divisions)
- **Text Primary:** `#ffffff` (High contrast text)
- **Text Secondary:** `#a1a1aa` (Muted text)

#### Status Colors
- **Success/Stable:** `#22c55e` (Green for stable operations)
- **Warning/Caution:** `#f59e0b` (Amber for attention needed)
- **Error/Critical:** `#ef4444` (Red for critical issues)
- **Info/Processing:** `#3b82f6` (Blue for information)

#### Agent-Specific Colors
- **Guardian:** `#3b82f6` (Blue - stability focus)
- **Optimizer:** `#22c55e` (Green - efficiency focus)  
- **Master Control:** `#f59e0b` (Amber - decision authority)

### Typography

#### Font Stack
```css
font-family: 'Inter', 'Segoe UI', 'Roboto', system-ui, sans-serif;
```

#### Font Sizes (Tailwind Scale)
- **Hero/KPI Values:** `text-4xl` (36px) - Large metrics display
- **Headers:** `text-2xl` (24px) - Section titles
- **Body:** `text-base` (16px) - Standard text
- **Caption:** `text-sm` (14px) - Secondary information
- **Labels:** `text-xs` (12px) - Form labels and metadata

### Spacing & Layout

#### Grid System
- **12-column responsive grid** using CSS Grid
- **Gap sizes:** 4px, 8px, 16px, 24px, 32px intervals
- **Container max-width:** 1400px for control room displays

#### Component Spacing
```css
/* Spacing scale (Tailwind) */
xs: 4px   (space-1)
sm: 8px   (space-2)  
md: 16px  (space-4)
lg: 24px  (space-6)
xl: 32px  (space-8)
```

## Component Library

### Core UI Components (shadcn/ui)

#### Button Component
```tsx
// Primary action button
<Button variant="default" size="lg">
  Approve & Execute
</Button>

// Secondary action
<Button variant="outline" size="md">
  View Details
</Button>

// Danger action
<Button variant="destructive" size="md">
  Emergency Stop
</Button>
```

#### Card Component
```tsx
<Card className="bg-gray-900 border-gray-700">
  <CardHeader>
    <CardTitle>KPI Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* KPI content */}
  </CardContent>
</Card>
```

### Custom Components

#### KPI Card
**Purpose:** Display real-time plant metrics with trend indicators

**Design Specifications:**
- **Size:** 280px wide × 160px height (minimum)
- **Layout:** Value prominently displayed, trend indicator, target range
- **States:** Normal, Warning, Critical, Offline

```tsx
interface KpiCardProps {
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical' | 'offline';
  target: { min: number; max: number };
}

<KpiCard
  title="Specific Power"
  value="28.5"
  unit="kWh/ton"
  trend="up"
  status="normal"
  target={{ min: 26, max: 30 }}
/>
```

#### Predictive Health Glyph
**Purpose:** Zero-cognition status indicators for plant systems

**Design Specifications:**
- **Size:** 48px × 48px circular icons
- **Animation:** Subtle pulsing for status changes
- **States:** 
  - Solid green circle (Stable)
  - Slow pulse yellow (Predicted deviation 30-60min)
  - Fast pulse red (Imminent deviation)

```tsx
interface HealthGlyphProps {
  system: 'kiln' | 'cooler' | 'mill';
  status: 'stable' | 'warning' | 'critical';
  prediction?: string;
}

<HealthGlyph
  system="kiln"
  status="stable"
  prediction="30min"
/>
```

#### Master Control Log
**Purpose:** Real-time display of AI decision process

**Design Specifications:**
- **Layout:** Terminal-style interface with syntax highlighting
- **Font:** Monospace font for code-like appearance
- **Colors:** Color-coded by agent type (Guardian=Blue, Optimizer=Green, Master=Amber)
- **Scrolling:** Auto-scroll to latest entries

```tsx
interface LogEntry {
  id: string;
  timestamp: Date;
  agent: 'guardian' | 'optimizer' | 'master';
  message: string;
  level: 'info' | 'warning' | 'error';
}

interface MasterControlLogProps {
  entries: LogEntry[];
  maxHeight?: string;
  autoScroll?: boolean;
}

<MasterControlLog
  entries={logEntries}
  maxHeight="400px"
  autoScroll={true}
/>
```

#### Autonomy Control Button
**Purpose:** Primary control for system autonomy state

**Design Specifications:**
- **Size:** Prominent header placement, 200px wide
- **States:** 
  - `AUTONOMY: ON` (Green background)
  - `AUTONOMY: PAUSED` (Yellow background + pulse animation)
  - `AUTONOMY: MANUAL` (Red background)

```tsx
interface AutonomyControlProps {
  state: 'on' | 'paused' | 'manual';
  onStateChange: (newState: 'on' | 'paused' | 'manual') => void;
  pulseOnPending?: boolean;
}

<AutonomyControl
  state="on"
  onStateChange={handleStateChange}
  pulseOnPending={true}
/>
```

#### Decision Hub Modal
**Purpose:** Rich interface for reviewing AI proposals

**Design Specifications:**
- **Size:** 80vw width × 70vh height (responsive)
- **Layout:** Three-panel design (Guardian proposal | Master synthesis | Optimizer proposal)
- **Actions:** Large, clear approve/reject buttons

```tsx
interface AgentProposal {
  id: string;
  agent: 'guardian' | 'optimizer';
  action: string;
  reasoning: string;
  impact: Record<string, number>;
  confidence: number;
}

interface DecisionHubProps {
  guardianProposal: AgentProposal;
  optimizerProposal: AgentProposal;
  masterSynthesis: string;
  onApprove: () => void;
  onReject: () => void;
}

<DecisionHub
  guardianProposal={proposal}
  optimizerProposal={proposal}
  masterSynthesis={synthesis}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

## User Experience Flows

### Primary User Journey: Managing Plant Autonomy

1. **Normal Operation View**
   - Operator sees green autonomy status
   - KPIs display within normal ranges
   - Health glyphs show stable status
   - Master Control Log shows routine decisions

2. **Decision Required Flow**
   - Autonomy status changes to yellow (paused)
   - Subtle pulse animation draws attention
   - Operator clicks autonomy button
   - Decision Hub modal opens with full context

3. **Decision Review Process**
   - Side-by-side AI proposals visible
   - Plain English reasoning displayed
   - Predicted impact charts shown
   - Clear approve/reject actions available

4. **Post-Decision**
   - Modal closes, autonomy resumes
   - Decision logged to history
   - Plant status updates reflected in dashboard

### Secondary Flow: AI Assistant Interaction

1. **Normal Chat**
   - Operator types question in chat interface
   - AI responds with plant-specific information
   - Chat history maintained for reference

2. **Proactive Assistance**
   - System detects potential issue
   - Chat panel highlights with contextual buttons
   - Operator can access relevant procedures/data
   - Reduces time-to-insight for problem resolution

## Responsive Design Requirements

### Breakpoints
- **Desktop (Primary):** 1200px+ (Control room displays)
- **Laptop:** 768px - 1199px (Engineering workstations)
- **Tablet:** 480px - 767px (Field tablets - limited functionality)
- **Mobile:** <480px (Emergency access only)

### Layout Adaptations
- **Desktop:** Full dashboard with all panels visible
- **Laptop:** Collapsible sidebar, optimized spacing
- **Tablet:** Stacked layout, touch-optimized controls
- **Mobile:** Essential KPIs only, emergency controls

## Accessibility Standards (WCAG 2.1 AA)

### Color Contrast
- **Text:** Minimum 4.5:1 contrast ratio
- **Large Text:** Minimum 3:1 contrast ratio
- **Status Indicators:** Never rely on color alone

### Keyboard Navigation
- **Tab Order:** Logical flow through interactive elements
- **Focus Indicators:** Clear visual focus states
- **Shortcuts:** Spacebar for autonomy pause, Enter for approval

### Screen Reader Support
- **Semantic HTML:** Proper heading hierarchy and landmarks
- **ARIA Labels:** Descriptive labels for complex components
- **Live Regions:** Real-time updates announced to screen readers

### Motor Accessibility
- **Target Size:** Minimum 44px × 44px for touch targets
- **Hover States:** Visual feedback for all interactive elements
- **Error Prevention:** Confirmation dialogs for critical actions

## Animation & Interaction Guidelines

### Micro-Interactions
- **Button Hover:** Subtle scale transform (scale-105)
- **Card Hover:** Slight elevation increase
- **Status Changes:** Smooth color transitions (300ms ease)

### Loading States
- **Skeleton Loading:** For KPI cards and data components
- **Spinner:** For modal dialogs and form submissions
- **Progressive Loading:** Show partial data while loading complete

### Notification System
- **Toast Messages:** Slide in from top-right corner
- **Persistent Alerts:** Remain until acknowledged
- **Success Feedback:** Brief confirmation animations

## Design Tokens (Tailwind Configuration)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        cemai: {
          // Brand colors
          primary: '#3b82f6',
          secondary: '#22c55e',
          accent: '#f59e0b',
          
          // Status colors
          stable: '#22c55e',
          warning: '#f59e0b',
          critical: '#ef4444',
          
          // Agent colors
          guardian: '#3b82f6',
          optimizer: '#22c55e',
          master: '#f59e0b',
        },
        dark: {
          // Dark theme
          background: '#0a0a0a',
          surface: '#1a1a1a',
          border: '#2a2a2a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
}

export default config
```

## Component Organization

### File Structure
```
src/components/
├── ui/                    # shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
├── shared/               # Custom reusable components
│   ├── Header.tsx
│   ├── KpiCard.tsx
│   ├── HealthGlyph.tsx
│   ├── MasterControlLog.tsx
│   └── AutonomyControl.tsx
└── features/            # Feature-specific components
    ├── glass-cockpit/
    ├── co-pilot/
    └── oracle/
```

### Component Naming Conventions
- **PascalCase** for component files and names
- **camelCase** for props and internal variables
- **kebab-case** for CSS classes and data attributes
- **SCREAMING_SNAKE_CASE** for constants

### TypeScript Interface Guidelines
```typescript
// Props interfaces should be clearly named
interface KpiCardProps {
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical' | 'offline';
  target: { min: number; max: number };
  onClick?: () => void;
  className?: string;
}

// Component state interfaces
interface ComponentState {
  isLoading: boolean;
  error: string | null;
  data: any; // Should be more specific in real implementation
}

// Event handler types
type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;
type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
```

## Testing Requirements

### Visual Regression Testing
- **Screenshot Tests:** For all major components
- **Cross-browser Testing:** Chrome, Firefox, Safari, Edge
- **Responsive Testing:** All defined breakpoints

### Accessibility Testing
- **Automated Testing:** axe-core integration with Vitest
- **Manual Testing:** Screen reader validation
- **Keyboard Testing:** Tab navigation flow

### Performance Testing
- **Load Time:** <3 second initial load
- **Component Rendering:** <100ms for state changes
- **Memory Usage:** Monitor for memory leaks in long sessions

### Component Testing with TypeScript
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KpiCard } from './KpiCard';
import type { KpiCardProps } from './KpiCard';

describe('KpiCard', () => {
  const defaultProps: KpiCardProps = {
    title: 'Test KPI',
    value: '25.5',
    unit: 'kWh/ton',
    trend: 'up',
    status: 'normal',
    target: { min: 20, max: 30 }
  };

  it('renders with correct props', () => {
    render(<KpiCard {...defaultProps} />);
    expect(screen.getByText('Test KPI')).toBeInTheDocument();
    expect(screen.getByText('25.5')).toBeInTheDocument();
  });

  it('handles click events when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<KpiCard {...defaultProps} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Dark Theme Implementation

### CSS Variables Approach
```css
:root {
  --background: 10 10 10;
  --foreground: 250 250 250;
  --card: 26 26 26;
  --card-foreground: 250 250 250;
  --popover: 26 26 26;
  --popover-foreground: 250 250 250;
  --primary: 59 130 246;
  --primary-foreground: 239 246 255;
  --secondary: 38 38 38;
  --secondary-foreground: 250 250 250;
  --muted: 38 38 38;
  --muted-foreground: 161 161 170;
  --accent: 38 38 38;
  --accent-foreground: 250 250 250;
  --destructive: 239 68 68;
  --destructive-foreground: 254 242 242;
  --border: 42 42 42;
  --input: 42 42 42;
  --ring: 59 130 246;
  --radius: 0.5rem;
}
```

### Component Dark Mode Support
```tsx
// All components should support dark mode by default
const KpiCard: React.FC<KpiCardProps> = ({ status, ...props }) => {
  const statusStyles = {
    normal: 'bg-cemai-stable/10 border-cemai-stable/20 text-cemai-stable',
    warning: 'bg-cemai-warning/10 border-cemai-warning/20 text-cemai-warning',
    critical: 'bg-cemai-critical/10 border-cemai-critical/20 text-cemai-critical',
    offline: 'bg-gray-500/10 border-gray-500/20 text-gray-500'
  };

  return (
    <Card className={cn(
      'bg-dark-surface border-dark-border',
      statusStyles[status],
      props.className
    )}>
      {/* Component content */}
    </Card>
  );
};
```

This UI/UX documentation ensures a consistent, accessible, and trust-building interface that supports the critical decision-making process in cement plant operations while maintaining full TypeScript support and modern development practices.

# Bug Tracking & Issue Management - CemAI Control Tower

## Issue Tracking Template

Use this template for documenting all bugs, errors, and issues encountered during development.

### Issue Format

```markdown
## Issue #[NUMBER]: [BRIEF_DESCRIPTION]

**Date:** [YYYY-MM-DD]
**Reporter:** [Name]
**Priority:** [Critical/High/Medium/Low]
**Status:** [Open/In Progress/Testing/Closed]
**Component:** [Affected component/feature]

### Description
[Detailed description of the issue]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Browser: [Chrome/Firefox/Safari/Edge + version]
- OS: [Windows/Mac/Linux + version]
- Screen Resolution: [Resolution]
- Node Version: [Version]
- TypeScript Version: [Version]

### Error Details
```
[Error messages, console logs, stack traces]
```

### Root Cause Analysis
[Technical analysis of why the issue occurred]

### Solution
[How the issue was resolved]

### Prevention
[Steps to prevent similar issues in the future]

### Related Issues
[Links to related bugs or features]
```

---

## Known Issues & Solutions

### Issue #001: TypeScript Performance with Large State Objects

**Date:** 2024-01-15
**Priority:** High
**Status:** Closed
**Component:** Zustand Store

#### Description
TypeScript compiler becomes slow when working with large state objects in Zustand store, especially with deeply nested KPI data structures.

#### Root Cause Analysis
Complex intersection types and deep object nesting in TypeScript interfaces caused excessive type checking overhead.

#### Solution
Implemented proper type segmentation and interface optimization:

```typescript
// Before: Complex nested interface
interface ComplexState {
  kpis: Record<string, {
    value: number;
    history: Array<{
      timestamp: Date;
      value: number;
      metadata: Record<string, unknown>;
    }>;
    // ... many more nested properties
  }>;
}

// After: Separated interfaces
interface KpiValue {
  value: number;
  timestamp: Date;
  status: KpiStatus;
}

interface KpiHistory {
  entries: KpiHistoryEntry[];
  lastUpdated: Date;
}

interface KpiState {
  current: Record<string, KpiValue>;
  history: Record<string, KpiHistory>;
}
```

#### Prevention
- Use interface segregation principle
- Avoid deep nesting in TypeScript interfaces
- Use type assertions sparingly
- Monitor TypeScript compilation performance

---

### Issue #002: WebSocket Connection Type Safety

**Date:** 2024-01-16
**Priority:** Medium
**Status:** Open
**Component:** Real-time Data Layer

#### Description
WebSocket event handlers lack proper TypeScript typing, causing runtime errors when message format changes.

#### Steps to Reproduce
1. Connect to WebSocket
2. Receive malformed message from backend
3. Frontend crashes due to undefined property access

#### Expected Behavior
Graceful handling of malformed messages with proper type validation.

#### Actual Behavior
Runtime TypeError when accessing properties that don't exist.

#### Solution (In Progress)
Implementing Zod schema validation for WebSocket messages:

```typescript
import { z } from 'zod';

const KpiUpdateSchema = z.object({
  type: z.literal('kpi_update'),
  data: z.record(z.object({
    value: z.number(),
    timestamp: z.string().datetime(),
    status: z.enum(['normal', 'warning', 'critical', 'offline'])
  }))
});

const AgentProposalSchema = z.object({
  type: z.literal('agent_proposal'),
  data: z.object({
    id: z.string(),
    agent: z.enum(['guardian', 'optimizer', 'master']),
    action: z.string(),
    reasoning: z.string()
  })
});

type WebSocketMessage = 
  | z.infer<typeof KpiUpdateSchema>
  | z.infer<typeof AgentProposalSchema>;

// Usage in WebSocket handler
const handleMessage = (rawMessage: unknown) => {
  try {
    const parsed = JSON.parse(rawMessage as string);
    
    if (parsed.type === 'kpi_update') {
      const validated = KpiUpdateSchema.parse(parsed);
      // Handle validated KPI update
    } else if (parsed.type === 'agent_proposal') {
      const validated = AgentProposalSchema.parse(parsed);
      // Handle validated proposal
    }
  } catch (error) {
    console.error('Invalid WebSocket message:', error);
    // Handle gracefully
  }
};
```

---

### Issue #003: React Component Props Drilling

**Date:** 2024-01-17
**Priority:** Medium
**Status:** Testing
**Component:** Dashboard Components

#### Description
Excessive props drilling through component hierarchy makes code hard to maintain and causes unnecessary re-renders.

#### Root Cause Analysis
- Deep component nesting without proper state management
- Props being passed through multiple levels
- Lack of proper context usage

#### Solution
Implemented context providers with TypeScript for shared state:

```typescript
// Context for KPI data
interface KpiContextValue {
  kpis: Record<string, KpiData>;
  updateKpi: (id: string, data: Partial<KpiData>) => void;
  loading: boolean;
  error: string | null;
}

const KpiContext = createContext<KpiContextValue | undefined>(undefined);

export const useKpiContext = (): KpiContextValue => {
  const context = useContext(KpiContext);
  if (!context) {
    throw new Error('useKpiContext must be used within KpiProvider');
  }
  return context;
};

// Provider component
export const KpiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kpis, setKpis] = useState<Record<string, KpiData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateKpi = useCallback((id: string, data: Partial<KpiData>) => {
    setKpis(prev => ({
      ...prev,
      [id]: { ...prev[id], ...data }
    }));
  }, []);

  const value: KpiContextValue = {
    kpis,
    updateKpi,
    loading,
    error
  };

  return (
    <KpiContext.Provider value={value}>
      {children}
    </KpiContext.Provider>
  );
};

// Usage in components
const KpiCard: React.FC<{ kpiId: string }> = ({ kpiId }) => {
  const { kpis } = useKpiContext();
  const kpi = kpis[kpiId];
  
  // No need to pass props down anymore
  return <div>{kpi?.value}</div>;
};
```

---

## Common Error Patterns & Solutions

### 1. TypeScript Type Assertion Issues

**Problem:** Overuse of `as` type assertions leading to runtime errors

**Solution:** Use type guards and proper validation

```typescript
// Bad: Unsafe type assertion
const data = response.data as KpiData;

// Good: Type guard with validation
const isKpiData = (obj: unknown): obj is KpiData => {
  return typeof obj === 'object' && 
         obj !== null && 
         'value' in obj && 
         'timestamp' in obj &&
         typeof (obj as any).value === 'number';
};

if (isKpiData(response.data)) {
  const data = response.data; // TypeScript knows it's KpiData
  // Safe to use data
}

// Better: Use Zod for runtime validation
const KpiDataSchema = z.object({
  value: z.number(),
  timestamp: z.date(),
  status: z.enum(['normal', 'warning', 'critical'])
});

const data = KpiDataSchema.parse(response.data);
```

### 2. State Management with TypeScript

**Problem:** State updates causing type errors and unwanted re-renders

**Solution:** Proper state typing and immutable updates

```typescript
// Define clear state interfaces
interface AppState {
  user: User | null;
  kpis: Record<string, KpiData>;
  ui: {
    activeModal: string | null;
    notifications: Notification[];
  };
}

// Use immer for complex state updates
import { produce } from 'immer';

const updateKpiValue = (state: AppState, kpiId: string, value: number) => 
  produce(state, draft => {
    if (draft.kpis[kpiId]) {
      draft.kpis[kpiId].value = value;
      draft.kpis[kpiId].lastUpdated = new Date();
    }
  });

// Or use Zustand with TypeScript
interface KpiStore {
  kpis: Record<string, KpiData>;
  actions: {
    updateKpi: (id: string, data: Partial<KpiData>) => void;
    resetKpis: () => void;
  };
}

const useKpiStore = create<KpiStore>((set) => ({
  kpis: {},
  actions: {
    updateKpi: (id, data) => set((state) => ({
      kpis: {
        ...state.kpis,
        [id]: { ...state.kpis[id], ...data }
      }
    })),
    resetKpis: () => set({ kpis: {} })
  }
}));
```

### 3. Async Operations and Error Handling

**Problem:** Unhandled promises and improper error typing

**Solution:** Proper async/await patterns with typed errors

```typescript
// Define error types
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Create typed error classes
class NetworkError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Proper async function typing
const fetchKpiData = async (kpiId: string): Promise<KpiData> => {
  try {
    const response = await fetch(`/api/kpis/${kpiId}`);
    
    if (!response.ok) {
      throw new NetworkError(response.status, `Failed to fetch KPI ${kpiId}`);
    }
    
    const data = await response.json();
    return KpiDataSchema.parse(data);
  } catch (error) {
    if (error instanceof NetworkError) {
      // Handle network errors
      throw error;
    } else if (error instanceof z.ZodError) {
      // Handle validation errors
      throw new ValidationError('response', 'Invalid KPI data format');
    } else {
      // Handle unknown errors
      throw new Error(`Unexpected error: ${error}`);
    }
  }
};

// Usage with proper error handling
const useKpiData = (kpiId: string) => {
  const [data, setData] = useState<KpiData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const kpiData = await fetchKpiData(kpiId);
        setData(kpiData);
      } catch (err) {
        if (err instanceof NetworkError) {
          setError(`Network error: ${err.message}`);
        } else if (err instanceof ValidationError) {
          setError(`Data validation error: ${err.message}`);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [kpiId]);

  return { data, error, loading };
};
```

## Debugging Tools & Techniques

### 1. TypeScript Debugging
```typescript
// Use TypeScript utility types for debugging
type DebugKpiData = {
  [K in keyof KpiData]: KpiData[K] extends infer T ? T : never;
};

// Create type-level assertions
type Assert<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;

// Test type equality
type TestKpiDataStructure = Assert<Equal<KpiData['status'], 'normal' | 'warning' | 'critical' | 'offline'>>;
```

### 2. Runtime Type Checking
```typescript
// Development-only runtime type checks
const withTypeCheck = <T>(schema: z.ZodSchema<T>) => (value: unknown): T => {
  if (process.env.NODE_ENV === 'development') {
    return schema.parse(value);
  }
  return value as T;
};

// Usage
const kpiData = withTypeCheck(KpiDataSchema)(response.data);
```

### 3. Component Debugging
```typescript
// Debug component props
const DebugProps: React.FC<{ props: Record<string, unknown> }> = ({ props }) => {
  if (process.env.NODE_ENV === 'development') {
    console.table(props);
  }
  return null;
};

// Usage in components
const KpiCard: React.FC<KpiCardProps> = (props) => {
  return (
    <>
      <DebugProps props={props} />
      {/* Component content */}
    </>
  );
};
```

## Testing Strategies

### 1. Unit Testing with Vitest
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('displays KPI data correctly', () => {
    render(<KpiCard {...defaultProps} />);
    expect(screen.getByText('Test KPI')).toBeInTheDocument();
    expect(screen.getByText('25.5')).toBeInTheDocument();
    expect(screen.getByText('kWh/ton')).toBeInTheDocument();
  });

  it('shows correct status styling', () => {
    const { rerender } = render(<KpiCard {...defaultProps} status="warning" />);
    expect(screen.getByTestId('kpi-card')).toHaveClass('border-cemai-warning');
    
    rerender(<KpiCard {...defaultProps} status="critical" />);
    expect(screen.getByTestId('kpi-card')).toHaveClass('border-cemai-critical');
  });

  it('handles click events with proper typing', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<KpiCard {...defaultProps} onClick={handleClick} />);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### 2. Integration Testing
```typescript
// Test store integration
import { act, renderHook } from '@testing-library/react';
import { useKpiStore } from '../services/kpiStore';

describe('KpiStore Integration', () => {
  it('updates KPI data correctly', () => {
    const { result } = renderHook(() => useKpiStore());
    
    act(() => {
      result.current.actions.updateKpi('power', {
        value: 28.5,
        status: 'normal',
        timestamp: new Date()
      });
    });
    
    expect(result.current.kpis.power.value).toBe(28.5);
    expect(result.current.kpis.power.status).toBe('normal');
  });
});
```

### 3. Type Testing
```typescript
// Test TypeScript types at compile time
import { expectType, expectError } from 'tsd';
import type { KpiData, KpiStatus } from '../types/kpi';

// Test valid type assignments
expectType<KpiStatus>('normal');
expectType<KpiStatus>('warning');
expectType<KpiStatus>('critical');
expectType<KpiStatus>('offline');

// Test invalid type assignments
expectError<KpiStatus>('invalid-status');

// Test object structure
const validKpiData: KpiData = {
  id: 'power',
  name: 'Specific Power',
  value: 28.5,
  unit: 'kWh/ton',
  status: 'normal',
  trend: 'up',
  target: { min: 26, max: 30 },
  timestamp: new Date()
};

expectType<KpiData>(validKpiData);
```

## Issue Escalation Process

### Priority Levels

#### Critical (P0)
- **Definition:** System is completely broken, security vulnerabilities, or data corruption
- **Response Time:** Immediate
- **Examples:** TypeScript compilation failures, security breaches, data loss

#### High (P1)
- **Definition:** Major functionality is broken or performance severely degraded
- **Response Time:** 4 hours
- **Examples:** Real-time data not updating, type errors in production, memory leaks

#### Medium (P2)
- **Definition:** Minor functionality issues or moderate performance problems
- **Response Time:** 24 hours
- **Examples:** UI glitches, slow loading times, TypeScript strict mode violations

#### Low (P3)
- **Definition:** Cosmetic issues, minor type inconsistencies, or feature requests
- **Response Time:** 1 week
- **Examples:** Missing type annotations, code style issues, minor UX improvements

### Escalation Contacts
1. **Technical Lead:** For TypeScript architecture and complex type issues
2. **Frontend Architect:** For component design and state management problems
3. **DevOps Engineer:** For build pipeline and deployment issues
4. **Security Team:** For type safety and security-related vulnerabilities

## Best Practices for Bug Prevention

1. **Strict TypeScript Configuration:** Enable all strict mode options
2. **Comprehensive Type Coverage:** Aim for >95% type coverage
3. **Code Reviews:** All code must be reviewed for type safety
4. **Automated Testing:** Maintain >80% test coverage with type testing
5. **Linting:** Use ESLint with TypeScript rules
6. **Runtime Validation:** Use Zod for API boundaries
7. **Error Boundaries:** Implement proper error boundaries with TypeScript
8. **Performance Monitoring:** Track bundle size and TypeScript compilation time

## Regular Maintenance Tasks

### Weekly
- [ ] Review and triage new issues
- [ ] Update TypeScript and dependency versions
- [ ] Check type coverage reports
- [ ] Review error logs and type-related issues

### Monthly
- [ ] Conduct type safety audit
- [ ] Performance optimization review for TypeScript compilation
- [ ] Update documentation with new type patterns
- [ ] Accessibility audit with type-safe components

### Quarterly
- [ ] Major TypeScript version updates
- [ ] Architecture review for type system
- [ ] User feedback analysis on type-related issues
- [ ] Technical debt assessment for type definitions

# MockQueryData System

This system provides dynamic mock data functionality for testing the DashboardPage with realistic penetration testing scenarios.

## Quick Start

### Running in Mock Mode

```bash
# Option 1: Use the test command (recommended)
npm run test:mock

# Option 2: Manual setup
cp public/test_config.json public/config.json
npm start
```

## Architecture

### Core Components

1. **MockQueryProvider** - Manages individual mock data streams with replay capabilities
2. **MockQueryRegistry** - Central registry for all mock providers
3. **useMockQuery / useConditionalQuery** - React hooks that conditionally use mock or real data
4. **Mock Data Configurations** - Predefined scenarios for different queries

### Key Features

- **Dynamic Data Progression**: Mock data evolves over time using `setInterval`
- **Replay System**: Each mock has `initData` and `replayData` with timed updates  
- **Conditional Loading**: Automatically switches between mock and live API based on config
- **Realistic Scenarios**: Mock data represents actual penetration testing workflows

## Mock Data Scenarios

### Agent Page Data (Spider Discovery)
- **Initial**: Empty site tree (just "/")
- **Step 1 (2s)**: Basic pages discovered (/login, /dashboard, /api)  
- **Step 2 (5s)**: More endpoints found (nested API routes, user areas)
- **Step 3 (9s)**: Complete site map with 24+ pages discovered

### Exploit Agents Discovery
- **Initial**: No agents running
- **Step 1 (3s)**: SQL Injection Hunter agent starts
- **Step 2 (8s)**: XSS Detector agent joins  
- **Step 3 (16s)**: Command Injection Finder agent starts

### Exploit Agent Steps
Progressive exploitation scenarios for each agent:

#### SQL Injection Hunter
1. Tests login form for SQL injection
2. Confirms vulnerability and extracts database names
3. Dumps database tables  
4. Extracts user credentials with password hashes

#### XSS Detector  
1. Scans search functionality for reflected XSS
2. Confirms vulnerability and tests for stored XSS
3. Crafts advanced payload to steal session cookies

#### Command Injection Finder
1. Tests file upload for command injection
2. Confirms vulnerability and attempts privilege escalation

## Configuration

### test_config.json
```json
{
    "apiProtocol": "http",
    "apiHost": "localhost", 
    "apiPort": 8000,
    "MOCK_DATA": true
}
```

### Adding New Mock Scenarios

1. **Define Mock Config**:
```typescript
export const myMockConfig: MockQueryDataConfig<MyDataType> = {
  id: "myQuery",
  initData: { /* initial state */ },
  replayData: [
    {
      delayMs: 2000,
      description: "First update",
      data: { /* partial update */ }
    }
  ]
};
```

2. **Update Query Hook**:
```typescript
export function useMyQuery(params) {
  const realQueryHook = () => useQuery({
    // ... real query config
  });

  return useConditionalQuery(
    "myQuery",
    realQueryHook, 
    myMockConfig,
    { enabled: true }
  );
}
```

## Reset Behavior

- **Page Refresh**: Resets all mock providers to `initData` and restarts replay
- **Manual Reset**: `mockRegistry.reset()` or `mockRegistry.reset(specificKey)`
- **Stop All**: `mockRegistry.stopAll()` halts all mock timers

## Development Benefits

- **Predictable Testing**: Consistent, repeatable data scenarios
- **No Backend Dependency**: Test frontend without running backend services
- **Performance Testing**: Observe UI with gradually increasing data loads
- **Demo Mode**: Showcase dynamic agent progression to stakeholders
- **Development Speed**: Faster iteration without waiting for real agent execution

## Implementation Details

### MockQueryProvider Features
- Deep cloning for immutable data updates
- Subscription system for React hook integration  
- Timer management with cleanup
- Status tracking (idle, running, completed, stopped)
- Optional looping for continuous scenarios

### Query Integration
- `useConditionalQuery` automatically switches based on `isMockDataEnabled()`
- Real queries remain unchanged when mock mode is disabled
- Mock queries support all React Query features (intervals, error states, etc.)

### Type Safety
- Full TypeScript support with generic mock providers
- Type-safe mock data configurations
- Compile-time validation of mock data structures

// MockQueryData types and interfaces

export interface MockReplayStep<T = any> {
  /** Delay in milliseconds before this data update */
  delayMs: number;
  /** Data to merge/update with current state */
  data: Partial<T>;
  /** Optional description for debugging */
  description?: string;
}

export interface MockQueryDataConfig<T = any> {
  /** Initial data state when mock starts */
  initData: T;
  /** Series of replay steps that update data over time */
  replayData: MockReplayStep<T>[];
  /** Whether to loop replay steps after completion (default: false) */
  loop?: boolean;
  /** Optional identifier for debugging */
  id?: string;
}

export interface MockQueryProvider<T = any> {
  /** Current mock data */
  getCurrentData(): T;
  /** Start the mock data replay */
  start(): void;
  /** Stop the mock data replay */
  stop(): void;
  /** Reset to initial state and optionally restart */
  reset(restart?: boolean): void;
  /** Get current replay status */
  getStatus(): MockReplayStatus;
  /** Subscribe to data changes */
  subscribe(callback: (data: T) => void): () => void;
}

export type MockReplayStatus = "idle" | "running" | "completed" | "stopped";

export interface MockQueryRegistry {
  register<T>(key: string, config: MockQueryDataConfig<T>): MockQueryProvider<T>;
  get<T>(key: string): MockQueryProvider<T> | undefined;
  reset(key?: string): void;
  stopAll(): void;
}

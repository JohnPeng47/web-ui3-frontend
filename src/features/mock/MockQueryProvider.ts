import type { MockQueryDataConfig, MockQueryProvider, MockReplayStatus, MockReplayStep } from "./types";

export class MockQueryProviderImpl<T> implements MockQueryProvider<T> {
  private config: MockQueryDataConfig<T>;
  private currentData: T;
  private status: MockReplayStatus = "idle";
  private timeouts: NodeJS.Timeout[] = [];
  private subscribers: Set<(data: T) => void> = new Set();
  private currentStepIndex = 0;

  constructor(config: MockQueryDataConfig<T>) {
    this.config = config;
    this.currentData = this.deepClone(config.initData);
  }

  getCurrentData(): T {
    return this.deepClone(this.currentData);
  }

  start(): void {
    if (this.status === "running") return;

    this.status = "running";
    this.currentStepIndex = 0;
    this.scheduleNextStep();
  }

  stop(): void {
    this.clearTimeouts();
    this.status = "stopped";
  }

  reset(restart = false): void {
    this.stop();
    this.currentData = this.deepClone(this.config.initData);
    this.currentStepIndex = 0;
    this.status = "idle";
    this.notifySubscribers();

    if (restart) {
      this.start();
    }
  }

  getStatus(): MockReplayStatus {
    return this.status;
  }

  subscribe(callback: (data: T) => void): () => void {
    this.subscribers.add(callback);
    // Immediately call with current data
    callback(this.getCurrentData());

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private scheduleNextStep(): void {
    if (this.status !== "running") return;

    const step = this.config.replayData[this.currentStepIndex];
    if (!step) {
      // Once all steps are complete, stay completed (no looping)
      this.status = "completed";
      return;
    }

    const timeout = setTimeout(() => {
      if (this.status !== "running") return;

      this.applyStep(step);
      this.currentStepIndex++;
      this.scheduleNextStep();
    }, step.delayMs);

    this.timeouts.push(timeout);
  }

  private applyStep(step: MockReplayStep<T>): void {
    this.currentData = this.mergeDeep(this.currentData, step.data);
    this.notifySubscribers();

    if (step.description && this.config.id) {
      console.log(`[MockProvider:${this.config.id}] ${step.description}`);
    }
  }

  private notifySubscribers(): void {
    const data = this.getCurrentData();
    this.subscribers.forEach(callback => callback(data));
  }

  private clearTimeouts(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }

  private deepClone<U>(obj: U): U {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as U;
    if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as unknown as U;
    if (typeof obj === "object") {
      const cloned = {} as { [key: string]: any };
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone((obj as any)[key]);
      });
      return cloned as U;
    }
    return obj;
  }

  private mergeDeep<U>(target: U, source: Partial<U>): U {
    const result = this.deepClone(target);

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = (result as any)[key];

        if (sourceValue !== undefined && this.isObject(sourceValue) && this.isObject(targetValue)) {
          (result as any)[key] = this.mergeDeep(targetValue, sourceValue as Partial<any>);
        } else if (sourceValue !== undefined) {
          (result as any)[key] = this.deepClone(sourceValue);
        }
      }
    }

    return result;
  }

  private isObject(item: any): boolean {
    return item && typeof item === "object" && !Array.isArray(item) && !(item instanceof Date);
  }
}

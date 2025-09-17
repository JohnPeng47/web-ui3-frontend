import type { MockQueryDataConfig, MockQueryProvider, MockQueryRegistry } from "./types";
import { MockQueryProviderImpl } from "./MockQueryProvider";

class MockQueryRegistryImpl implements MockQueryRegistry {
  private providers = new Map<string, MockQueryProvider<any>>();

  register<T>(key: string, config: MockQueryDataConfig<T>): MockQueryProvider<T> {
    // Stop existing provider if it exists
    const existing = this.providers.get(key);
    if (existing) {
      existing.stop();
    }

    const provider = new MockQueryProviderImpl(config);
    this.providers.set(key, provider);
    return provider;
  }

  get<T>(key: string): MockQueryProvider<T> | undefined {
    return this.providers.get(key);
  }

  reset(key?: string): void {
    if (key) {
      const provider = this.providers.get(key);
      if (provider) {
        provider.reset();
      }
    } else {
      this.providers.forEach(provider => provider.reset());
    }
  }

  stopAll(): void {
    this.providers.forEach(provider => provider.stop());
  }
}

// Singleton instance
export const mockRegistry = new MockQueryRegistryImpl();

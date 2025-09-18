declare module "zustand" {
  export function create<T>(
    initializer: (
      set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
      get: () => T
    ) => T
  ): (selector: (s: T) => any) => any;
}



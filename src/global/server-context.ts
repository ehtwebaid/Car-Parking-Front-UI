// src/global/ssr-request-context.ts
import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

export function setRequestContext(key: string, value: any) {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.set(key, value);
  }
}

export function getRequestContext<T = any>(key: string): T | undefined {
  const store = asyncLocalStorage.getStore();
  return store?.get(key);
}

export function runWithContext<T>(callback: () => T) {
  const store = new Map<string, any>();
  return asyncLocalStorage.run(store, callback);
}

type CacheKey = string;

type CacheEntry<TValue> = {
  promise?: Promise<TValue>;
  value?: TValue;
  hasValue: boolean;
};

function defaultCacheKey(args: unknown[]) {
  return args.length === 0 ? "__default" : JSON.stringify(args);
}

export function createSessionResourceCache<TArgs extends unknown[], TValue>(
  load: (...args: TArgs) => Promise<TValue>,
  getKey: (...args: TArgs) => CacheKey = (...args) => defaultCacheKey(args),
) {
  const entries = new Map<CacheKey, CacheEntry<TValue>>();

  async function get(...args: TArgs) {
    const key = getKey(...args);
    const cached = entries.get(key);

    if (cached?.hasValue) {
      return cached.value as TValue;
    }

    if (cached?.promise) {
      return cached.promise;
    }

    const entry: CacheEntry<TValue> = { hasValue: false };
    const promise = load(...args).then((value) => {
      entry.value = value;
      entry.hasValue = true;
      entry.promise = undefined;
      return value;
    });

    entry.promise = promise;
    entries.set(key, entry);

    try {
      return await promise;
    } catch (error) {
      entries.delete(key);
      throw error;
    }
  }

  function invalidate(...args: TArgs) {
    entries.delete(getKey(...args));
  }

  function clear() {
    entries.clear();
  }

  return {
    clear,
    get,
    invalidate,
  };
}
import { Requestor, RequestOptions, Response, CacheStore, CacheOptions, RequestConfig } from './types';
import SparkMD5 from 'spark-md5';

let requestor: Requestor;

export function inject(req: Requestor) {
  requestor = req;
}

export function useRequestor(): Requestor {
  if (!requestor) {
    throw new Error('Requestor not initialized. Call inject() first.');
  }
  return requestor;
}

export function createRetryRequestor(maxCount = 5): Requestor {
  const req = useRequestor();
  return {
    async get(url: string, options?: RequestOptions): Promise<Response> {
      let attempts = 0;
      while (attempts < maxCount) {
        try {
          return await req.get(url, options);
        } catch (error) {
          attempts++;
          if (attempts === maxCount) throw error;
        }
      }
      throw new Error('Max retry attempts reached');
    },
    post: req.post.bind(req)
  };
}

export function createParallelRequestor(maxCount = 4): Requestor {
  const req = useRequestor();
  let activeRequests = 0;
  const queue: Array<() => Promise<Response>> = [];

  const execute = async () => {
    if (activeRequests >= maxCount || queue.length === 0) return;
    activeRequests++;
    const task = queue.shift()!;
    try {
      const result = await task();
      activeRequests--;
      execute();
      return result;
    } catch (error) {
      activeRequests--;
      execute();
      throw error;
    }
  };

  return {
    async get(url: string, options?: RequestOptions): Promise<Response> {
      return new Promise((resolve, reject) => {
        queue.push(async () => {
          try {
            const response = await req.get(url, options);
            resolve(response);
            return response;
          } catch (error) {
            reject(error);
            throw error;
          }
        });
        execute();
      });
    },
    post: req.post.bind(req)
  };
}

export function createMemoryStore(): CacheStore {
  const store = new Map<string, { value: any; timestamp: number }>();
  return {
    async has(key: string) {
      return store.has(key);
    },
    async set<T>(key: string, value: T) {
      store.set(key, { value, timestamp: Date.now() });
    },
    async get<T>(key: string): Promise<T | undefined> {
      const entry = store.get(key);
      return entry ? entry.value : undefined;
    }
  };
}

export function createStorageStore(): CacheStore {
  return {
    async has(key: string) {
      return !!localStorage.getItem(key);
    },
    async set<T>(key: string, value: T) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    async get<T>(key: string): Promise<T | undefined> {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : undefined;
    }
  };
}

export function useCacheStore(persist: boolean): CacheStore {
  return persist ? createStorageStore() : createMemoryStore();
}

export function createCacheRequestor(cacheOptions: CacheOptions = {}): Requestor {
  const options: CacheOptions = {
    key: (config) => config.url,
    persist: false,
    duration: 60 * 60 * 1000,
    isValid: (key, config, timestamp) => {
      if (cacheOptions.duration) {
        return Date.now() - timestamp! < cacheOptions.duration;
      }
      return cacheOptions.isValid ? cacheOptions.isValid(key, config) : true;
    },
    ...cacheOptions
  };

  const store = useCacheStore(options.persist!);
  const req = useRequestor();

  return {
    async get(url: string, reqOptions?: RequestOptions): Promise<Response> {
      const config: RequestConfig = {
        url,
        method: 'GET',
        headers: reqOptions?.headers,
        params: reqOptions?.params
      };
      const key = options.key!(config);

      const cached = await store.get<{ data: any; timestamp: number }>(key);
      if (cached && options.isValid!(key, config, cached.timestamp)) {
        return {
          status: 200,
          headers: {},
          json: async () => cached.data
        };
      }

      const response = await req.get(url, reqOptions);
      const data = await response.json();
      await store.set(key, { data, timestamp: Date.now() });
      return response;
    },
    post: req.post.bind(req)
  };
}

export function hashRequest(config: RequestConfig): string {
  const spark = new SparkMD5();
  spark.append(config.url);
  for (const [key, value] of Object.entries(config.headers || {})) {
    spark.append(key);
    spark.append(value);
  }
  spark.append(JSON.stringify(config.body || {}));
  return spark.end();
}

export function createIdempotentRequestor(genKey?: (config: RequestConfig) => string): Requestor {
  return createCacheRequestor({
    key: genKey || hashRequest,
    persist: false
  });
}
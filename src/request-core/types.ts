export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export interface Response {
  status: number;
  headers: Record<string, string>;
  json: () => Promise<any>;
}

export interface Requestor {
  get(url: string, options?: RequestOptions): Promise<Response>;
  post(url: string, data: any, options?: RequestOptions): Promise<Response>;
}

export interface CacheStore {
  has(key: string): Promise<boolean>;
  set<T>(key: string, value: T): Promise<void>;
  get<T>(key: string): Promise<T | undefined>;
}

export interface CacheOptions {
  key?: (config: RequestConfig) => string;
  persist?: boolean;
  duration?: number;
  isValid?: (key: string, config: RequestConfig, timestamp?: number) => boolean;
}

export interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}
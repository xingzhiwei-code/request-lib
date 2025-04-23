import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Requestor, RequestOptions, Response } from '../request-core/types';

export const axiosRequestor: Requestor = {
  async get(url: string, options?: RequestOptions): Promise<Response> {
    const config: AxiosRequestConfig = {
      params: options?.params,
      headers: options?.headers
    };
    const response: AxiosResponse = await axios.get(url, config);
    return {
      status: response.status,
      headers: Object.fromEntries(
        Object.entries(response.headers).map(([key, value]) => [key, String(value)])
      ),
      json: async () => response.data
    };
  },

  async post(url: string, data: any, options?: RequestOptions): Promise<Response> {
    const config: AxiosRequestConfig = {
      headers: options?.headers
    };
    const response: AxiosResponse = await axios.post(url, data, config);
    return {
      status: response.status,
      headers: Object.fromEntries(
        Object.entries(response.headers).map(([key, value]) => [key, String(value)])
      ),
      json: async () => response.data
    };
  }
};
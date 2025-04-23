import { inject, useRequestor, createCacheRequestor } from '../index';
import { axiosRequestor } from '../request-imp/axios';
import axios from 'axios';

jest.mock('axios');

describe('Requestor', () => {
  beforeAll(() => {
    inject(axiosRequestor);
  });

  it('should initialize requestor', () => {
    expect(useRequestor()).toBe(axiosRequestor);
  });

  it('should cache GET requests', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: { foo: 'bar' }, headers: {} });

    const cacheReq = createCacheRequestor({ persist: false });
    const response1 = await cacheReq.get('/test');
    const response2 = await cacheReq.get('/test');

    expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Only called once due to cache
    expect(await response1.json()).toEqual({ foo: 'bar' });
    expect(await response2.json()).toEqual({ foo: 'bar' });
  });
});
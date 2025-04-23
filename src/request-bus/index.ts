import { inject } from '../request-core/core';
import { axiosRequestor } from '../request-imp/axios';

inject(axiosRequestor);

export * from '../request-core/core';
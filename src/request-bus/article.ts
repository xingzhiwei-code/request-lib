// article.ts

import { createIdempotentRequest, useRequestor } from '@xingzhiwei/request-lib';

/**
 * 发布文章
 */
export const publishArticle = (() => {
  const req = createIdempotentRequest();
  return async (data: any) => {
    return req.post('/api/article', { data }).then(resp => resp.json());
  };
})();

/**
 * 获取文章
 */
export const getArticles = (() => {
  const req = useRequestor();
  return async (page: number, size: number) => {
    return req.get('/api/article', { params: { page, size } }).then(resp => resp.json());
  };
})();


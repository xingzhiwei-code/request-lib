# @xingzhiwei/request-lib

一个模块化、可扩展、基于 TypeScript 的 HTTP 请求库，专为企业级业务应用设计，支持请求重试、缓存、幂等性和并发控制等高级功能。包含一个 CLI 工具，可根据 API 规范自动生成请求样板代码。

## 目录
- [概述](#概述)
- [架构](#架构)
- [功能特性](#功能特性)
- [安装](#安装)
- [快速开始](#快速开始)
- [CLI 工具使用](#cli-工具使用)
  - [用途](#用途)
  - [使用场景](#使用场景)
  - [示例](#示例)
- [贡献](#贡献)
- [许可证](#许可证)

## 概述
`@xai/request-lib` 是一个生产就绪的 HTTP 请求库，旨在解决前端开发中的常见问题，例如请求重试、缓存、幂等性以及业务协议整合的需求。该库设计目标包括：
- **模块化**：将功能分为实现层、核心层和业务层，职责清晰。
- **可扩展**：支持切换请求实现（如 Axios、Fetch）和自定义缓存存储。
- **可复用**：与框架无关，可用于 React、Vue 或纯 JavaScript 项目。
- **高效**：提供 CLI 工具，自动生成样板代码，减少开发时间。

该库使用 TypeScript 提供类型安全，遵循依赖倒置原则（DIP），确保灵活性和可维护性。

## 架构
库采用三层架构设计，如下图所示：

![架构图](https://resource.duyiedu.com/yuanjin/202403151501992.svg)

1. **请求实现层（`request-imp`）**：
   - 提供底层的 HTTP 请求功能。
   - 默认使用 Axios 实现，支持切换到 Fetch 或 XHR。
   - 示例：`src/request-imp/axios.ts`。

2. **请求核心层（`request-core`）**：
   - 实现高级功能，如请求重试、并发控制、缓存和幂等性。
   - 通过依赖倒置原则（DIP）与实现层解耦，支持无缝切换请求实现。
   - 示例：`src/request-core/core.ts`。

3. **请求业务层（`request-bus`）**：
   - 集成公司内部协议和 API 规范。
   - 提供业务友好的 API 接口，供应用直接调用。
   - 示例：`src/request-bus/index.ts`。

此外，**CLI 工具**（`cli/index.js`）可根据 API 规范自动生成业务层代码，大幅减少手动工作量。

## 功能特性
- **请求重试**：支持配置最大重试次数，自动重试失败请求。
- **并发控制**：限制最大并发请求数，防止服务器过载。
- **缓存**：支持内存和持久化（localStorage）缓存，可自定义缓存键和有效性。
- **幂等性**：通过 MD5 哈希确保重复请求返回缓存结果。
- **类型安全**：全面支持 TypeScript，提供健壮的开发体验。
- **自动化**：CLI 工具根据 API 规范生成样板代码，支持幂等和分页接口。
- **扩展性**：无需修改核心逻辑即可添加新的请求实现或缓存存储。

## 安装
通过 npm 安装库：

```bash
npm install @xingzhiwei/request-lib
```

确保已安装 Node.js（建议 v16 或更高版本）。

## 快速开始
以下是使用库的基本示例：

```ts
import { createCacheRequestor, createIdempotentRequestor } from '@xai/request-lib';

// 创建缓存请求器
const cachedReq = createCacheRequestor({
  key: (config) => config.url,
  persist: false,
  duration: 60 * 1000 // 1 分钟
});

// 发起缓存 GET 请求
cachedReq.get('https://jsonplaceholder.typicode.com/posts/1')
  .then(resp => resp.json())
  .then(data => console.log(data));

// 创建幂等请求器
const idempotentReq = createIdempotentRequestor();
idempotentReq.post('https://jsonplaceholder.typicode.com/posts', { title: '测试' })
  .then(resp => resp.json())
  .then(data => console.log(data));
```

## CLI 工具使用

### 用途
CLI 工具（`request-templet-cli`）用于为 `request-bus` 层自动生成请求样板代码。它读取 JSON 格式的 API 规范，生成 TypeScript 文件，包含封装好的请求函数。该工具特别适合：
- 减少手动编写请求代码的工作量。
- 确保请求处理的一致性。
- 支持高级功能，如幂等性和分页。

### 使用场景
- **大规模项目**：当项目包含数百个 API 接口时，手动编写请求代码耗时且易出错。CLI 工具可生成标准化的代码，节省开发时间。
- **频繁的 API 更新**：API 规范频繁变更时，CLI 工具可快速重新生成代码，降低维护成本。
- **业务协议整合**：生成的代码遵循公司内部协议（如认证、幂等性），确保合规性。
- **团队协作**：为前端开发者提供一致的 API 接口，降低学习成本，提高协作效率。

### 示例
1. **准备 API 规范**：
   创建一个 JSON 文件（例如 `api-spec.json`），定义 API 接口：

   ```json
   {
     "endpoints": {
       "article": {
         "publishArticle": {
           "path": "/api/article",
           "description": "发布文章",
           "method": "POST",
           "auth": true,
           "idempotent": true,
           "cache": false,
           "pager": false
         },
         "getArticles": {
           "path": "/api/article",
           "description": "获取文章",
           "method": "GET",
           "auth": false,
           "idempotent": false,
           "cache": false,
           "pager": true
         }
       }
     }
   }
   ```

2. **运行 CLI 工具**：
   使用以下命令生成样板代码：

   ```bash
   npx request-templet-cli ./api-spec.json ./src/request-bus
   ```

3. **输出**：
   工具会在 `src/request-bus` 目录下生成文件 `article.ts`，内容如下：

   ```ts
   // article.ts

   import { createIdempotentRequest, useRequestor } from '@xai/request-lib';

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
   ```

4. **使用生成的代码**：
   在应用中导入并使用生成的函数：

   ```ts
   import { publishArticle, getArticles } from './request-bus/article';

   async function main() {
     // 发布文章
     await publishArticle({ title: '我的文章', content: '你好，世界！' });
     
     // 获取文章
     const articles = await getArticles(1, 10);
     console.log(articles);
   }

   main();
   ```

5. **自定义生成的代码**：
   如果生成的代码无法完全满足需求，您可以手动编辑输出文件（例如 `article.ts`），或实现补丁系统以在重新生成时保留自定义修改。

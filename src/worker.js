export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // 获取静态资源
      const asset = await env.ASSETS.fetch(request);
      
      // 如果资源存在，直接返回
      if (asset.status !== 404) {
        return asset;
      }

      // 如果是 HTML 页面或其他请求，返回 index.html（用于 SPA 路由）
      if (!pathname.includes('.') || pathname.endsWith('.html')) {
        const indexRequest = new Request(new URL('/', request.url), request);
        return await env.ASSETS.fetch(indexRequest);
      }

      // 其他情况返回 404
      return asset;
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

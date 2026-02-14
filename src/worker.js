export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
      // 先尝试获取静态资源
      let response = await env.ASSETS.fetch(request);
      
      // 如果资源找到了，直接返回
      if (response.status !== 404) {
        return response;
      }

      // 如果请求的是文件（有扩展名），但找不到，返回 404
      if (pathname.includes('.')) {
        return response; // 返回原始的 404 响应
      }

      // 对于 SPA 路由，返回 index.html
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
    } catch (error) {
      return new Response('Error: ' + error.message, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
};

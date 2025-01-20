export default async function handler(request, context) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /Googlebot|googlebot|bingbot/i.test(userAgent);
  
  if (isBot) {
    const seoPath = url.pathname === '/' ? '/seo/index.html' : `/seo${url.pathname}/index.html`;
    return context.rewrite(seoPath);
  }
  
  return context.next();
}

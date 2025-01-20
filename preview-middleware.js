import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROUTES = [
  '/porownaj-systemy-erp',
  '/systemy-erp',
  '/partnerzy',
  '/koszt-wdrozenia-erp'
];

export default function historyApiFallback(req, res, next) {
  const { url } = req;
  const route = url.split('?')[0].split('#')[0];

  if (route !== '/' && !route.includes('.')) {
    if (ROUTES.includes(route)) {
      const htmlFile = path.join(__dirname, 'dist', route.slice(1), 'index.html');
      if (fs.existsSync(htmlFile)) {
        const content = fs.readFileSync(htmlFile, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.end(content);
        return;
      }
    }
  }
  next();
}

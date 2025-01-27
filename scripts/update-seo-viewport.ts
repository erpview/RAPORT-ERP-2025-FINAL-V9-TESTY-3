import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SEO_DIR = join(process.cwd(), 'public', 'seo');

// New viewport and mobile meta tags
const newMetaTags = `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-touch-fullscreen" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="HandheldFriendly" content="true" />
  <meta name="MobileOptimized" content="width" />`;

function updateViewportInFile(filePath: string) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    
    // Replace existing viewport meta tag
    content = content.replace(
      /<meta name="viewport"[^>]*>/,
      newMetaTags
    );
    
    writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error);
  }
}

function processDirectory(dir: string) {
  const items = readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = join(dir, item.name);
    
    if (item.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.name === 'index.html') {
      updateViewportInFile(fullPath);
    }
  }
}

try {
  processDirectory(SEO_DIR);
  console.log('✅ Successfully updated viewport settings in all SEO pages');
} catch (error) {
  console.error('❌ Error processing SEO directory:', error);
}

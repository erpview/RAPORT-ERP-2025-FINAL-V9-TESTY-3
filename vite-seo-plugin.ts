import { Plugin, HtmlTagDescriptor } from 'vite';
import fs from 'fs/promises';
import path from 'path';

interface RouteMap {
  [key: string]: string;
}

const ROUTES_MAP: RouteMap = {
  'index.html': '',
  'porownaj-systemy-erp/index.html': 'porownaj-systemy-erp',
  'systemy-erp/index.html': 'systemy-erp',
  'partnerzy/index.html': 'partnerzy',
  'koszt-wdrozenia-erp/index.html': 'koszt-wdrozenia-erp',
  'slownik-erp/index.html': 'slownik-erp',
  'kalkulator/index.html': 'kalkulator',
  'kalkulator.html': 'kalkulator',
  'firmy-it/index.html': 'firmy-it'
};

// List of partner slugs for SEO
const PARTNER_SLUGS = [
  'anegis',
  'asseco-business-solutions',
  'axians',
  'bpsc',
  'deveho-consulting',
  'digitland',
  'enova',
  'ipcc',
  'it.integro',
  'proalpha',
  'rambase',
  'rho-software',
  'sente',
  'simple',
  'streamsoft',
  'symfonia',
  'sygnity-business-solutions',
  'vendo.erp'
];

// Function to check if a term SEO file exists
async function termSeoExists(termSlug: string): Promise<boolean> {
  try {
    await fs.access(path.join(process.cwd(), 'slownik-erp', termSlug, 'index.html'));
    return true;
  } catch {
    return false;
  }
}

// Helper function to extract meta tags from SEO HTML
function extractMetaTags(html: string) {
  const metaTags: { [key: string]: string } = {};
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/);
  if (titleMatch) {
    metaTags.title = titleMatch[1];
  }
  
  // Extract meta tags
  const matches = html.match(/<meta[^>]+>/g) || [];
  matches.forEach(tag => {
    const nameMatch = tag.match(/name="([^"]+)"/);
    const contentMatch = tag.match(/content="([^"]+)"/);
    const propertyMatch = tag.match(/property="([^"]+)"/);
    const charsetMatch = tag.match(/charset="([^"]+)"/);
    
    if (charsetMatch) {
      metaTags['charset'] = charsetMatch[1];
    } else if ((nameMatch || propertyMatch) && contentMatch) {
      const key = nameMatch ? nameMatch[1] : propertyMatch![1];
      metaTags[key] = contentMatch[1];
    }
  });
  
  // Extract canonical link
  const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
  if (canonicalMatch) {
    metaTags.canonical = canonicalMatch[1];
  }
  
  // Extract structured data
  const structuredDataMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g);
  if (structuredDataMatches) {
    try {
      const jsonData = structuredDataMatches.map(match => {
        const content = match.replace(/<script[^>]*>|<\/script>/g, '').trim();
        return JSON.parse(content);
      });
      metaTags.structuredData = JSON.stringify(jsonData[0], null, 2); // Use first structured data block
    } catch (err) {
      console.error('SEO Plugin: Error parsing structured data JSON:', err);
    }
  }
  
  return metaTags;
}

// Helper function to inject meta tags into HTML
function injectMetaTags(html: string, metaTags: { [key: string]: string }) {
  // Remove existing SEO tags
  html = html.replace(/<title>.*?<\/title>/, '');
  html = html.replace(/<meta[^>]+>/g, '');
  html = html.replace(/<link[^>]+rel="canonical"[^>]*>/g, '');
  html = html.replace(/<script[^>]+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, '');
  
  // Insert new meta tags before closing head tag
  let metaHtml = '';
  
  // Add charset first
  if (metaTags.charset) {
    metaHtml += `<meta charset="${metaTags.charset}">\n`;
  }
  
  // Add viewport
  metaHtml += `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
  
  if (metaTags.title) {
    metaHtml += `<title>${metaTags.title}</title>\n`;
  }
  
  Object.entries(metaTags).forEach(([key, value]) => {
    if (['title', 'structuredData', 'charset'].includes(key)) return;
    
    if (key.startsWith('og:')) {
      metaHtml += `<meta property="${key}" content="${value}">\n`;
    } else if (key === 'canonical') {
      metaHtml += `<link rel="canonical" href="${value}">\n`;
    } else {
      metaHtml += `<meta name="${key}" content="${value}">\n`;
    }
  });
  
  if (metaTags.structuredData) {
    metaHtml += `<script type="application/ld+json">${metaTags.structuredData}</script>\n`;
  }
  
  return html.replace('</head>', metaHtml + '</head>');
}

export function seoPlugin(): Plugin {
  return {
    name: 'vite-plugin-seo',
    enforce: 'pre',
    configureServer(server) {
      console.log('SEO Plugin: Initializing...');
      
      // Handle client-side routing in development and preview
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '/';
        const route = url.split('?')[0].split('#')[0];
        
        // Handle calculator page
        if (route === '/kalkulator') {
          const seoPath = path.join(process.cwd(), 'public/seo/kalkulator/index.html');
          
          try {
            const seoContent = await fs.readFile(seoPath, 'utf-8');
            const metaTags = extractMetaTags(seoContent);
            
            // Inject SEO meta tags into the HTML response
            res.setHeader('Content-Type', 'text/html');
            let html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
            html = injectMetaTags(html, metaTags);
            
            return res.end(html);
          } catch (error) {
            console.error('Error serving calculator page:', error);
          }
        }

        // Handle companies index page
        if (route === '/firmy-it') {
          const seoPath = path.join(process.cwd(), 'public/seo/firmy-it/index.html');
          
          try {
            const seoContent = await fs.readFile(seoPath, 'utf-8');
            const metaTags = extractMetaTags(seoContent);
            
            // Inject SEO meta tags into the HTML response
            res.setHeader('Content-Type', 'text/html');
            let html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
            html = injectMetaTags(html, metaTags);
            
            return res.end(html);
          } catch (error) {
            console.error('Error serving companies index page:', error);
            next();
          }
        }

        // Handle dictionary index page
        if (route === '/slownik-erp') {
          const seoPath = path.join(process.cwd(), 'public/seo/slownik-erp/index.html');
          
          try {
            const seoContent = await fs.readFile(seoPath, 'utf-8');
            const metaTags = extractMetaTags(seoContent);
            
            // Inject SEO meta tags into the HTML response
            res.setHeader('Content-Type', 'text/html');
            let html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
            html = injectMetaTags(html, metaTags);
            
            return res.end(html);
          } catch (error) {
            console.error('Error serving dictionary index page:', error);
          }
        }

        // Handle dictionary term pages
        const termMatch = route.match(/^\/slownik-erp\/([^\/]+)$/);
        if (termMatch) {
          const termSlug = termMatch[1];
          const seoPath = path.join(process.cwd(), 'public/seo/slownik-erp', termSlug, 'index.html');
          
          try {
            const seoContent = await fs.readFile(seoPath, 'utf-8');
            const metaTags = extractMetaTags(seoContent);
            
            // Inject SEO meta tags into the HTML response
            res.setHeader('Content-Type', 'text/html');
            let html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
            html = injectMetaTags(html, metaTags);
            
            return res.end(html);
          } catch (error) {
            console.error(`Error serving dictionary term page for ${termSlug}:`, error);
            next();
          }
        }

        // Handle systems page
        if (route === '/systemy-erp') {
          const seoPath = path.join(process.cwd(), 'public/seo/systemy-erp/index.html');
          
          try {
            const seoContent = await fs.readFile(seoPath, 'utf-8');
            const metaTags = extractMetaTags(seoContent);
            
            // Inject SEO meta tags into the HTML response
            res.setHeader('Content-Type', 'text/html');
            let html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
            html = injectMetaTags(html, metaTags);
            
            return res.end(html);
          } catch (error) {
            console.error('Error serving systems page:', error);
            next();
          }
        }

        // Handle partners page
        if (route === '/partnerzy') {
          const seoPath = path.join(process.cwd(), 'public/seo/partnerzy/index.html');
          
          try {
            const seoContent = await fs.readFile(seoPath, 'utf-8');
            const metaTags = extractMetaTags(seoContent);
            
            // Inject SEO meta tags into the HTML response
            res.setHeader('Content-Type', 'text/html');
            let html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
            html = injectMetaTags(html, metaTags);
            
            return res.end(html);
          } catch (error) {
            console.error('Error serving partners index page:', error);
            next();
          }
        }

        // Handle individual partner pages
        const partnerMatch = route.match(/^\/partnerzy\/([^\/]+)$/);
        if (partnerMatch) {
          const partnerSlug = partnerMatch[1];
          const seoPath = path.join(process.cwd(), 'public/seo/partnerzy', partnerSlug, 'index.html');
          
          try {
            const seoContent = await fs.readFile(seoPath, 'utf-8');
            const metaTags = extractMetaTags(seoContent);
            
            // Inject SEO meta tags into the HTML response
            res.setHeader('Content-Type', 'text/html');
            let html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf-8');
            html = injectMetaTags(html, metaTags);
            
            return res.end(html);
          } catch (error) {
            console.error(`Error serving partner page for ${partnerSlug}:`, error);
            next();
          }
        }
        
        next();
      });
    },
    async buildStart() {
      // Ensure SEO files are copied to build output
      const projectDir = process.cwd();
      const seoDir = path.join(projectDir, 'public/seo');
      const outDir = path.join(projectDir, 'dist');
      
      try {
        // Create dist/seo directory if it doesn't exist
        await fs.mkdir(path.join(outDir, 'seo'), { recursive: true });
        
        // Copy all SEO files to dist/seo
        await fs.cp(seoDir, path.join(outDir, 'seo'), { recursive: true });
        console.log('SEO Plugin: Copied all SEO files to dist/seo');
        
        // Read all dictionary terms
        const termsDir = path.join(seoDir, 'slownik-erp');
        const terms = await fs.readdir(termsDir);
        
        // Create output directories and copy SEO files
        for (const term of terms) {
          if (term === 'index.html' || term === 'structured-data.json') continue;
          
          const termSeoPath = path.join(termsDir, term, 'index.html');
          const termOutDir = path.join(outDir, 'slownik-erp', term);
          
          try {
            await fs.access(termSeoPath);
            console.log('SEO Plugin: Found SEO file for term:', term);
            
            // Create output directory
            await fs.mkdir(termOutDir, { recursive: true });
            
            // Copy SEO file
            await fs.copyFile(termSeoPath, path.join(termOutDir, 'index.html'));
            console.log('SEO Plugin: Copied SEO file for term:', term);
          } catch (err) {
            console.log('SEO Plugin: No SEO file for term:', term);
          }
        }
      } catch (err) {
        console.error('SEO Plugin: Error processing SEO files:', err);
      }
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        try {
          // Get the route path from the filename
          const projectDir = process.cwd();
          if (!ctx.filename) {
            console.warn('SEO Plugin: No filename provided in context');
            return html;
          }
          const relativePath = path.relative(projectDir, ctx.filename);
          const routePath = relativePath.replace(/^dist[/\\]/, '');
          
          console.log('SEO Plugin: Build context:', {
            filename: ctx.filename,
            relativePath,
            routePath
          });
          
          // Check if this is a partner page
          const partnerMatch = routePath.match(/^partnerzy\/([^\/]+)\/index\.html$/);
          let seoFolder = '';
          
          if (partnerMatch && PARTNER_SLUGS.includes(partnerMatch[1])) {
            seoFolder = `partnerzy/${partnerMatch[1]}`;
          } else {
            // Handle static pages
            const staticRoutes: { [key: string]: string } = {
              'kalkulator/index.html': 'kalkulator',
              'kalkulator.html': 'kalkulator',
              'systemy-erp/index.html': 'systemy-erp',
              'systemy-erp.html': 'systemy-erp',
              'porownaj-systemy-erp/index.html': 'porownaj-systemy-erp',
              'porownaj-systemy-erp.html': 'porownaj-systemy-erp',
              'slownik-erp/index.html': 'slownik-erp',
              'slownik-erp.html': 'slownik-erp',
              'partnerzy/index.html': 'partnerzy',
              'partnerzy.html': 'partnerzy',
              'koszt-wdrozenia-erp/index.html': 'koszt-wdrozenia-erp',
              'koszt-wdrozenia-erp.html': 'koszt-wdrozenia-erp',
              'firmy-it/index.html': 'firmy-it',
              'firmy-it.html': 'firmy-it',
              'index.html': ''
            };
            
            seoFolder = staticRoutes[routePath] || '';
            console.log('SEO Plugin: Static route path:', routePath, 'mapped to:', seoFolder);
          }

          // Check if this is a dictionary term page
          const termMatch = routePath.match(/^slownik-erp\/([^\/]+)\/index\.html$/);
          if (termMatch) {
            seoFolder = `slownik-erp/${termMatch[1]}`;
          }
          
          const seoPath = path.join(projectDir, 'public/seo', seoFolder, 'index.html');
          
          console.log('SEO Plugin: Using SEO folder:', seoFolder);
          console.log('SEO Plugin: Looking for file:', seoPath);
          
          let seoHtml;
          try {
            seoHtml = await fs.readFile(seoPath, 'utf-8');
            console.log('SEO Plugin: Successfully read route-specific SEO file');
          } catch (err) {
            console.log('SEO Plugin: No route-specific SEO file, using default');
            seoHtml = await fs.readFile(path.join(projectDir, 'public/seo/index.html'), 'utf-8');
          }
          
          // Extract metadata from SEO HTML
          const metaTags: HtmlTagDescriptor[] = [];
          const matches = seoHtml.match(/<meta[^>]+>/g) || [];
          const titleMatch = seoHtml.match(/<title[^>]*>(.*?)<\/title>/);
          const structuredDataMatch = seoHtml.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
          const canonicalMatch = seoHtml.match(/<link[^>]+rel="canonical"[^>]*>/);
          
          console.log('SEO Plugin: Found meta tags:', matches.length);
          
          // Remove existing SEO tags from HTML
          html = html.replace(/<title>.*?<\/title>/, '');
          html = html.replace(/<meta[^>]+name="[^"]*"[^>]*>/g, '');
          html = html.replace(/<meta[^>]+property="[^"]*"[^>]*>/g, '');
          html = html.replace(/<link[^>]+rel="canonical"[^>]*>/g, '');
          html = html.replace(/<script[^>]+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, '');
          
          // Add only SEO-specific meta tags (skip viewport and charset)
          matches.forEach(tag => {
            if (!tag.includes('viewport') && !tag.includes('charset')) {
              // Parse meta tag attributes
              const nameMatch = tag.match(/name="([^"]+)"/);
              const contentMatch = tag.match(/content="([^"]+)"/);
              const propertyMatch = tag.match(/property="([^"]+)"/);
              
              if ((nameMatch || propertyMatch) && contentMatch) {
                metaTags.push({
                  tag: 'meta',
                  attrs: {
                    ...(nameMatch ? { name: nameMatch[1] } : {}),
                    ...(propertyMatch ? { property: propertyMatch[1] } : {}),
                    content: contentMatch[1]
                  },
                  injectTo: 'head' as const
                });
              }
            }
          });

          const tags: HtmlTagDescriptor[] = [];

          // Add title if found
          if (titleMatch) {
            console.log('SEO Plugin: Adding title:', titleMatch[1]);
            tags.push({
              tag: 'title',
              children: titleMatch[1],
              injectTo: 'head' as const
            });
          }

          // Add meta tags
          tags.push(...metaTags);
          console.log('SEO Plugin: Added', metaTags.length, 'meta tags');

          // Add canonical link if found
          if (canonicalMatch) {
            const href = canonicalMatch[0].match(/href="([^"]+)"/)
            if (href && href[1]) {
              console.log('SEO Plugin: Adding canonical link');
              tags.push({
                tag: 'link',
                attrs: {
                  rel: 'canonical',
                  href: href[1]
                },
                injectTo: 'head' as const
              });
            }
          }

          // Add structured data if found
          if (structuredDataMatch) {
            console.log('SEO Plugin: Adding structured data');
            const structuredData = structuredDataMatch[1].trim();
            try {
              // Validate JSON and format it
              const jsonData = JSON.parse(structuredData);
              tags.push({
                tag: 'script',
                attrs: { type: 'application/ld+json' },
                children: JSON.stringify(jsonData, null, 2),
                injectTo: 'head' as const
              });
              console.log('SEO Plugin: Successfully added structured data');
            } catch (err) {
              console.error('SEO Plugin: Error parsing structured data JSON:', err);
            }
          }

          console.log('SEO Plugin: Successfully generated', tags.length, 'tags');
          return {
            html,
            tags
          };
        } catch (error) {
          console.error('SEO Plugin Error:', error);
          return html;
        }
      }
    }
  };
}

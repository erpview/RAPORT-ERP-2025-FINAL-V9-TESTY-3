# Partner SEO Generator

This tool automatically generates SEO pages for new partners in the Raport ERP project.

## Usage

### 1. Add New Partner Data

Edit `scripts/generate-partner-seo.ts` and add your new partner(s) to the `partners` array:

```typescript
const partners: Partner[] = [
  {
    name: 'New Partner Name',
    slug: 'new-partner-slug',
    website: 'https://partner-website.com',
    keywords: ['relevant', 'keywords', 'for', 'partner']
  }
];
```

### 2. Run the Generator

```bash
# From the project root
npm run generate:partner-seo
```

Or using ts-node directly:

```bash
npx ts-node scripts/generate-partner-seo.ts
```

### 3. Verify Generated Files

The script will create SEO files at:
```
public/seo/partnerzy/[partner-slug]/index.html
```

## Partner Data Structure

```typescript
interface Partner {
  name: string;      // Full partner name
  slug: string;      // URL-friendly version of name
  website: string;   // Partner's website URL
  keywords?: string[]; // Optional SEO keywords
}
```

## Generated SEO Content

For each partner, the script generates:
- Title tag with partner name
- Meta description
- Keywords
- OpenGraph tags
- Canonical URL
- Schema.org structured data

## Template Customization

The SEO template is located at `templates/partner-seo.html`. You can modify it to:
- Update meta tag formats
- Add new placeholders
- Modify structured data
- Change SEO content structure

## Adding to Vite SEO Plugin

The generated SEO pages are automatically handled by the Vite SEO plugin. No additional configuration is needed.

## Error Handling

The script will:
- Create missing directories
- Skip existing files (won't overwrite)
- Log success/failure for each partner
- Continue processing if one partner fails

## Best Practices

1. Use URL-safe slugs (lowercase, hyphens for spaces)
2. Provide relevant keywords for each partner
3. Verify partner websites are valid URLs
4. Keep partner names consistent across the platform

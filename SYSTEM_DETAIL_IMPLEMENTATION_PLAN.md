# Plan for Implementing System Detail Pages

## Overview
Create individual detail pages for each ERP system listed in the catalog, accessible via `/systemy-erp/[system-name]` URLs, while maintaining current SEO setup and edge functionality.

## Current Setup Analysis
1. **Routing**: Using React Router with Vite
2. **SEO**: Using edge functionality for Netlify with dynamic SEO data
3. **Data**: Systems data fetched via Supabase
4. **Current Pages**: Systems catalog at `/systemy-erp`

## Implementation Steps

### 1. Create New Route and Component
- Create new route `/systemy-erp/[system-name]`
- Create new component `SystemDetail.tsx`
- Implement dynamic routing using React Router
- Ensure proper navigation between catalog and detail pages

### 2. SEO Implementation
- Add new SEO template for system detail pages in `seo.ts`:
  ```typescript
  'system-detail': {
    id: 'system-detail',
    page_identifier: 'system-detail',
    is_dynamic: true,
    title_template: '{systemName} - System ERP | Raport ERP 2025',
    description_template: '{systemDescription}',
    keywords_template: '{systemName}, system erp, {vendor}, raport erp'
  }
  ```
- Update SEO service to handle dynamic system data
- Ensure edge functionality is maintained for SEO

### 3. Data Handling
- Create new hook `useSystemDetail` for fetching individual system data
- Implement data fetching using Supabase
- Handle loading and error states
- Ensure data consistency with system catalog

### 4. UI Components
- Create system detail layout
- Reuse existing card components and styles
- Add additional sections if needed
- Implement responsive design
- Add navigation back to catalog

### 5. Edge Function Updates
- Update edge functions to handle new routes
- Ensure proper SEO data generation for system detail pages
- Maintain current edge functionality for existing routes

### 6. Testing Plan
1. **Functionality Testing**
   - Route navigation
   - Data loading
   - SEO data generation
   - Edge function operation

2. **SEO Testing**
   - Meta tags
   - Structured data
   - Dynamic content generation
   - Edge function responses

3. **Performance Testing**
   - Page load times
   - Edge function response times
   - Data fetching optimization

### 7. URL Structure
- Format: `/systemy-erp/[system-name]`
- System name should be URL-friendly (lowercase, hyphens)
- Handle special characters and spaces in system names
- Implement proper URL encoding/decoding

## Required Files to Create/Modify

1. **New Files**:
   - `/src/pages/SystemDetail.tsx`
   - `/src/hooks/useSystemDetail.ts`
   - `/src/types/systemDetail.ts`

2. **Files to Modify**:
   - `/src/services/seo.ts` - Add new SEO template
   - `/src/components/SystemsCatalog.tsx` - Add links to detail pages
   - `vite.config.ts` - Update routing configuration
   - Edge function files - Add support for new routes

## Dependencies
- No new dependencies required
- Using existing:
  - React Router
  - Supabase
  - Edge functions
  - SEO service

## Risks and Mitigations
1. **Risk**: Breaking current SEO
   - **Mitigation**: Thorough testing of edge functions and SEO data generation

2. **Risk**: Performance impact
   - **Mitigation**: Implement proper data caching and loading states

3. **Risk**: URL conflicts
   - **Mitigation**: Implement proper route matching and error handling

## Success Criteria
1. Detail pages accessible via `/systemy-erp/[system-name]`
2. SEO data properly generated and served
3. All current functionality maintained
4. Edge functions working correctly
5. Performance metrics within acceptable range

## Implementation Order
1. Create basic route and component structure
2. Implement data fetching
3. Add SEO templates and edge function support
4. Build UI components
5. Add navigation and linking
6. Testing and optimization

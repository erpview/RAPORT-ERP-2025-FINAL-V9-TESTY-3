# Mobile Comparison Feature Changes Documentation

## Overview
This document outlines the changes made to implement a mobile-friendly comparison feature in the ERP system catalog.

## Changes Made

### 1. Limit Systems on Mobile
**File:** `src/components/SystemsCatalog.tsx`
```typescript
// Added mobile detection
const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
const maxSystems = isMobile ? 2 : 4;

// Added resize listener
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 640);
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### 2. Updated Compare Button
**File:** `src/components/SystemsCatalog.tsx`
```tsx
<Scale className="w-5 h-5 mr-2" />
<span className="hidden sm:inline">
  {isSelected ? 'Usuń z raportu ERP' : 'Dodaj do raportu ERP'}
</span>
<span className="sm:hidden">
  ERP
</span>
```

### 3. Added Mobile Floating Bar
**File:** `src/components/SystemsCatalog.tsx`
```tsx
{selectedSystems.length > 0 && (
  <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-t border-[#d2d2d7]/30">
    <div className="p-4">
      {/* Counter and Compare Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#2c3b67]" />
          <span className="text-[15px] font-medium text-[#1d1d1f]">
            {selectedSystems.length}/{maxSystems} systemów
          </span>
        </div>
        <Link
          to="/porownaj-systemy-erp?compare=true"
          className={`sf-button-primary text-[15px] py-2
            ${selectedSystems.length < 2 
              ? 'opacity-50 cursor-not-allowed' 
              : ''}`}
          onClick={(e) => {
            if (selectedSystems.length < 2) {
              e.preventDefault();
            }
          }}
        >
          Porównaj systemy
        </Link>
      </div>
      
      {/* Selected Systems Chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {selectedSystems.map((system) => (
          <div
            key={system.id}
            className="flex items-center gap-2 bg-[#F5F5F7] px-3 py-1.5 rounded-full flex-shrink-0"
          >
            <span className="text-[13px] font-medium text-[#1d1d1f]">
              {system.name}
            </span>
            <button
              onClick={() => handleCompareToggle(system)}
              className="p-0.5 hover:bg-[#E8E8ED] rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-[#86868b]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
```

### 4. Automatic Modal Opening
**File:** `src/pages/Compare.tsx`
```tsx
import { useLocation } from 'react-router-dom';

export const Compare: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if we should open the modal automatically
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('compare') === 'true' && selectedSystems.length >= 2) {
      setIsModalOpen(true);
    }
  }, [location.search, selectedSystems.length]);
  // ...
};
```

## Key Features

1. **Mobile Detection**
   - Automatically detects mobile devices (width < 640px)
   - Updates on window resize
   - Limits comparison to 2 systems on mobile

2. **Floating Bar**
   - Full-width design on mobile
   - Semi-transparent background with blur effect
   - Shows current selection count
   - Displays selected systems as chips
   - Quick remove functionality

3. **Automatic Modal Opening**
   - Redirects to `/porownaj-systemy-erp?compare=true`
   - Automatically opens comparison modal on page load
   - Prevents navigation if less than 2 systems selected
   - Maintains modal state based on URL parameter

4. **Styling Details**
   - Background: `bg-white/80` with `backdrop-blur-md`
   - Border: Light top border `border-[#d2d2d7]/30`
   - Typography: 
     - Counter: 15px with medium weight
     - System names: 13px with medium weight
   - Icons:
     - Scale icon in blue (#2c3b67)
     - Remove (X) icon in gray (#86868b)

## Testing Instructions

1. Open http://localhost:5173/systemy-erp
2. Test on mobile device or using browser dev tools (width < 640px)
3. Verify:
   - Maximum 2 systems can be selected on mobile
   - Floating bar appears when systems are selected
   - System chips are scrollable
   - Compare button is disabled until 2 systems are selected
   - Removal of systems works correctly
   - Clicking "Porównaj systemy" with 2 systems selected:
     - Redirects to `/porownaj-systemy-erp?compare=true`
     - Automatically opens the comparison modal
     - Maintains selected systems in the modal

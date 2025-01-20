# Companies Catalog Evolution Plan

## Database Structure

### Company Interface
```typescript
interface Company {
  id: string;
  name: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  contact: {
    phone: string;
    website: string;
    email: string;
  };
  description: string;
  logo_url: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  
  // Owner management
  created_by: string;          // UUID of the creator (owner)
  owner_id: string;           // UUID of current owner (can be different from creator)
  owner_email: string;        // Email of current owner (for display purposes)
  
  // Additional metadata
  created_at: string;
  updated_at: string;
}
```

## Database Tables

```sql
-- Companies table with owner management
create table companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  street text,
  postal_code text,
  city text,
  phone text,
  website text,
  email text,
  description text,
  logo_url text,
  status text default 'draft',
  
  -- Owner management
  created_by uuid references auth.users(id),
  owner_id uuid references auth.users(id),
  owner_email text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Add foreign key constraints
  constraint fk_owner
    foreign key (owner_id)
    references auth.users(id)
    on delete set null
);

-- Row Level Security (RLS) policies
-- Enable RLS
alter table companies enable row level security;

-- Policies for different roles
create policy "Public users can view published companies"
  on companies for select
  using (status = 'published');

create policy "Owners can update their own companies"
  on companies for update
  using (auth.uid() = owner_id);

create policy "Editors can create companies"
  on companies for insert
  using (
    exists (
      select 1 from user_management
      where user_id = auth.uid()
      and (role = 'editor' or role = 'admin')
      and is_active = true
    )
  );

create policy "Admins have full access"
  on companies for all
  using (
    exists (
      select 1 from user_management
      where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
    )
  );
```

## Component Structure
```
src/
├── components/
│   ├── companies/
│   │   ├── CompaniesCatalog.tsx
│   │   ├── CompanyCard.tsx
│   │   ├── CompanyGrid.tsx
│   │   ├── CompanyForm.tsx
│   │   ├── CompanyModuleForm.tsx
│   │   ├── CompanyFilters.tsx
│   │   ├── ReassignCompanyOwnerModal.tsx  # New component for owner reassignment
│   │   └── CompanyStatusBadge.tsx         # Status indicator
│   └── ui/
├── pages/
│   ├── Companies.tsx
│   ├── AdminCompanies.tsx                 # Enhanced with owner management
│   └── EditorCompanies.tsx
└── hooks/
    ├── useCompanies.ts
    └── useCompanyOwnership.ts             # New hook for ownership management
```

## Owner Management Features

### Admin Capabilities
- View all companies and their owners
- Reassign company ownership to any editor
- Override company status regardless of owner
- Delete companies (with confirmation)

### Editor Capabilities
- Create new companies (becomes initial owner)
- Edit own companies
- Submit companies for review
- Cannot reassign ownership (admin only)

### Owner-specific Features
- Dashboard view of owned companies
- Status management of owned companies
- Edit company details and modules
- Cannot reassign ownership (admin only)

## Implementation Details

### Owner Management UI Components
```typescript
// ReassignCompanyOwnerModal.tsx
interface ReassignCompanyOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  currentOwner: string;
  onSuccess: () => void;
}

// AdminCompanies.tsx owner management functions
const handleReassignOwner = async (companyId: string, newOwnerId: string) => {
  try {
    const { error } = await supabase
      .from('companies')
      .update({
        owner_id: newOwnerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (error) throw error;
    // Refresh companies list
    loadCompanies();
  } catch (error) {
    console.error('Error reassigning owner:', error);
    toast.error('Nie udało się zmienić właściciela');
  }
};
```

### Access Control Implementation
```typescript
// useCompanyOwnership.ts
export const useCompanyOwnership = (companyId: string) => {
  const { user, isAdmin } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  
  useEffect(() => {
    const checkOwnership = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('companies')
        .select('owner_id')
        .eq('id', companyId)
        .single();
        
      setIsOwner(data?.owner_id === user.id);
    };
    
    checkOwnership();
  }, [companyId, user]);
  
  return {
    isOwner,
    canEdit: isOwner || isAdmin,
    canReassign: isAdmin,
    canDelete: isAdmin
  };
};
```

## Security Considerations
- Ownership transfer requires admin privileges
- Automatic email notifications for ownership changes
- Audit trail for ownership changes
- Prevention of orphaned companies (always must have an owner)

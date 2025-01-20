import { supabase, adminSupabase } from '../config/supabase';
import { System } from '../types/system';
import { systems as localSystems } from '../data/systems';

export const fetchSystems = async (): Promise<System[]> => {
  try {
    const { data, error } = await supabase
      .from('systems')
      .select('*')
      .eq('status', 'published');

    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.sort((a, b) => {
        const vendorCompare = a.vendor.localeCompare(b.vendor);
        if (vendorCompare !== 0) return vendorCompare;
        return a.name.localeCompare(b.name);
      });
    }

    return localSystems;
  } catch (error) {
    console.error('Error fetching systems:', error);
    return localSystems;
  }
};

export const fetchAdminSystems = async (): Promise<System[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Use adminSupabase if user is admin, otherwise use regular client
    const client = userData.user.app_metadata?.role === 'admin' ? adminSupabase : supabase;

    const { data, error } = await client
      .from('systems')
      .select('*')
      .order('vendor')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin systems:', error);
    throw error;
  }
};

export const updateSystem = async (id: string, systemData: Partial<System>): Promise<System> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Check if user is admin from app_metadata
  const isAdmin = userData.user.app_metadata?.role === 'admin';

  // If admin, use adminSupabase for the operation
  const client = isAdmin ? adminSupabase : supabase;

  // If editor, set status to pending
  const updateData = isAdmin ? systemData : {
    ...systemData,
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null
  };

  const { data, error } = await client
    .from('systems')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createSystem = async (systemData: Omit<System, 'id'>): Promise<System> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Check if user is admin from app_metadata
  const isAdmin = userData.user.app_metadata?.role === 'admin';

  // Use appropriate client based on role
  const client = isAdmin ? adminSupabase : supabase;

  const newSystem = {
    ...systemData,
    created_by: userData.user.id,
    status: isAdmin ? 'published' : 'pending'
  };

  const { data, error } = await client
    .from('systems')
    .insert([newSystem])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSystem = async (id: string): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Check if user is admin from app_metadata
  const isAdmin = userData.user.app_metadata?.role === 'admin';

  // Use appropriate client based on role
  const client = isAdmin ? adminSupabase : supabase;

  const { error } = await client
    .from('systems')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const reviewSystem = async (
  id: string, 
  status: 'published' | 'rejected',
  reviewNotes: string
): Promise<System> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Always use adminSupabase for review operations
  const updateData = {
    status,
    review_notes: reviewNotes,
    reviewed_by: userData.user.id,
    reviewed_at: new Date().toISOString()
  };

  const { data, error } = await adminSupabase
    .from('systems')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
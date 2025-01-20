export interface Module {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

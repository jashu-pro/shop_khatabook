export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string | null;
  photo_url: string | null;
  photo_path: string | null;
  village: string | null;
  address: string | null;
  notes: string | null;
  credit_limit: number;
  
  created_at: string;
  updated_at: string;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

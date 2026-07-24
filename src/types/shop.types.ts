export interface Shop {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_phone: string;
  owner_photo_url: string | null;
  owner_photo_path: string | null;

  shop_name: string;
  shop_code: string;
  shop_logo_url: string | null;
  shop_logo_path: string | null;
  business_category: string;

  door_number: string | null;
  street: string | null;
  area: string | null;
  village_town: string;
  mandal: string | null;
  district: string;
  state: string;
  pin_code: string;
  country: string;

  gst: string | null;
  pan: string | null;
  upi_id: string | null;
  business_email: string | null;

  language: string;
  currency: string;
  theme: string;

  payment_reminder: boolean;
  whatsapp_reminder: boolean;
  sms_reminder: boolean;
  ai_daily_summary: boolean;

  created_at: string;
  updated_at: string;
}

export type CreateShopInput = Omit<Shop, 'id' | 'created_at' | 'updated_at'>;
export type UpdateShopInput = Partial<CreateShopInput>;

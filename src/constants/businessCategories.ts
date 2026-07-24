export interface BusinessCategory {
  id: string;
  name: string;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: 'grocery', name: 'Grocery & Kirana' },
  { id: 'apparel', name: 'Apparel & Clothing' },
  { id: 'electronics', name: 'Electronics & Mobiles' },
  { id: 'bakery', name: 'Bakery & Sweets' },
  { id: 'medical', name: 'Pharmacy & Medical Store' },
  { id: 'hardware', name: 'Hardware & Sanitary' },
  { id: 'footwear', name: 'Footwear & Accessories' },
  { id: 'stationery', name: 'Books & Stationery' },
  { id: 'restaurant', name: 'Restaurant & Café' },
  { id: 'salon', name: 'Salon & Beauty Parlour' },
  { id: 'jewellery', name: 'Jewellery & Watches' },
  { id: 'other', name: 'Other Business Type' },
];

export type StoreItem = {
  id: string;
  name: string;
  cost: number;
  icon?: string;
};

export const STORE_ITEMS: StoreItem[] = [
  { id: 'retro_radio', name: 'Radio retro', cost: 2500000 },
  { id: 'neon_light', name: 'Đèn neon', cost: 2800000 },
  { id: 'vintage_tables', name: 'Bàn ghế vintage', cost: 3000000 },
  { id: 'sign_vintage', name: 'Biển hiệu cổ điển', cost: 2200000 },
  { id: 'premium_cart', name: 'Xe đẩy cao cấp', cost: 3000000 },
];

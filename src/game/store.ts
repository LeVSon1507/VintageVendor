export type StoreItem = {
  id: string;
  name: string;
  cost: number;
  icon?: string;
};

export const STORE_ITEMS: StoreItem[] = [
  { id: 'retro_radio', name: 'Thêm radio ngầu đét', cost: 2500000 },
  { id: 'extra_tables', name: 'Mua thêm bàn ghế', cost: 2700000 },
  { id: 'lanterns', name: 'Mua thêm đèn lồng', cost: 2800000 },
  { id: 'snack_display', name: 'Mua giá trưng bày snack', cost: 2900000 },
  { id: 'premium_cart', name: 'Nâng cấp xe đẩy hạng sang', cost: 3000000 },
];

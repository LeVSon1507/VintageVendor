export type IngredientCategoryKey =
  | 'base'
  | 'protein'
  | 'liquid'
  | 'topping'
  | 'spices';

export const INGREDIENT_CATEGORIES: Record<IngredientCategoryKey, string[]> = {
  base: ['banh_mi', 'banh_bo_nguyen_lieu', 'dau_nanh'],
  protein: ['thit_nguoi', 'thit_xien', 'ca_vien'],
  liquid: [
    'nuoc',
    'nuoc_soi',
    'nuoc_duong',
    'nuoc_cot_dua',
    'soda',
    'tuong_ot',
  ],
  topping: ['do_chua', 'hat_che', 'da_vien', 'chanh', 'dua_leo', 'rau_que'],
  spices: ['duong', 'gia_vi', 'bot_ca_phe', 'muoi', 'tieu'],
};

export const CATEGORY_LABELS: Record<IngredientCategoryKey, string> = {
  base: 'Cơ bản',
  protein: 'Thịt',
  liquid: 'Chất lỏng',
  topping: 'Topping',
  spices: 'Gia vị',
};

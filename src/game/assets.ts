export type ItemAsset = {
  id: string;
  displayName: string;
};

export const ITEM_ASSETS: Record<string, ItemAsset> = {
  cafe_vot: {
    id: 'cafe_vot',
    displayName: 'Cà phê vợt',
  },
  sua_dau_nanh: {
    id: 'sua_dau_nanh',
    displayName: 'Sữa đậu nành',
  },
  banh_mi_thit: {
    id: 'banh_mi_thit',
    displayName: 'Bánh mì thịt',
  },
  che: {
    id: 'che',
    displayName: 'Chè',
  },
  xien_que: {
    id: 'xien_que',
    displayName: 'Xiên que',
  },
  banh_bo: {
    id: 'banh_bo',
    displayName: 'Bánh bò',
  },
  soda_da_chanh: {
    id: 'soda_da_chanh',
    displayName: 'Soda đá chanh',
  },
};

export const ITEM_IMAGES: Record<string, any> = {
  cafe_vot: require('../assets/images/foods/cafe_vot.webp'),
  sua_dau_nanh: require('../assets/images/foods/sua_dau_nanh.webp'),
  banh_mi_thit: require('../assets/images/foods/banh_mi_thit.webp'),
  che: require('../assets/images/foods/che.webp'),
  xien_que: require('../assets/images/foods/xien_que.webp'),
  banh_bo: require('../assets/images/foods/banh_bo.webp'),
  soda_da_chanh: require('../assets/images/foods/soda_da_chanh.webp'),
};

export function getItemImage(id: string): any {
  return ITEM_IMAGES[id];
}

export const INGREDIENT_IMAGES: Record<string, any> = {
  bot_ca_phe: require('../assets/images/ingredient/bot_ca_phe.webp'),
  nuoc_soi: require('../assets/images/ingredient/nuoc_soi.webp'),
  nuoc: require('../assets/images/ingredient/nuoc.webp'),
  duong: require('../assets/images/ingredient/duong.webp'),
  dau_nanh: require('../assets/images/ingredient/dau_nanh.webp'),
  banh_mi: require('../assets/images/ingredient/banh_mi.webp'),
  thit_nguoi: require('../assets/images/ingredient/thit_nguoi.webp'),
  do_chua: require('../assets/images/ingredient/do_chua.webp'),
  tuong_ot: require('../assets/images/ingredient/tuong_ot.webp'),
  hat_che: require('../assets/images/ingredient/hat_che.webp'),
  nuoc_duong: require('../assets/images/ingredient/nuoc_duong.webp'),
  da_vien: require('../assets/images/ingredient/da_vien.webp'),
  thit_xien: require('../assets/images/ingredient/thit_xien.webp'),
  gia_vi: require('../assets/images/ingredient/gia_vi.webp'),
  banh_bo_nguyen_lieu: require('../assets/images/ingredient/banh_bo_nguyen_lieu.webp'),
  nuoc_cot_dua: require('../assets/images/ingredient/nuoc_cot_dua.webp'),
  soda: require('../assets/images/ingredient/soda.webp'),
  chanh: require('../assets/images/ingredient/chanh.webp'),
};

export function getIngredientImage(id: string): any {
  return INGREDIENT_IMAGES[id] || INGREDIENT_IMAGES['nuoc_soi'];
}

export const STALL_IMAGE = require('../assets/images/stall/stall.webp');
export function getStallImage(): any {
  return STALL_IMAGE;
}

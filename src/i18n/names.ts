import useGameStore from '../store/gameStore';

const ITEM_NAMES: Record<'vi' | 'en', Record<string, string>> = {
  vi: {
    cafe_vot: 'Cà phê vợt',
    sua_dau_nanh: 'Sữa đậu nành',
    banh_mi_thit: 'Bánh mì thịt',
    che: 'Chè',
    xien_que: 'Xiên que',
    banh_bo: 'Bánh bò',
    soda_da_chanh: 'Soda đá chanh',
    soda_chai: 'Soda chai',
    xien_que_tuong_ot: 'Xiên que tương ớt',
    ca_vien_chien: 'Cá viên chiên',
    soda_chanh_muoi: 'Soda chanh muối',
  },
  en: {
    cafe_vot: 'Sock coffee',
    sua_dau_nanh: 'Soy milk',
    banh_mi_thit: 'Banh mi (cold cuts)',
    che: 'Vietnamese dessert (Che)',
    xien_que: 'Skewers',
    banh_bo: 'Banh bo cake',
    soda_da_chanh: 'Lime soda',
    soda_chai: 'Bottle soda',
    xien_que_tuong_ot: 'Spicy skewers',
    ca_vien_chien: 'Fried fish balls',
    soda_chanh_muoi: 'Salted lime soda',
  },
};

const INGREDIENT_NAMES: Record<'vi' | 'en', Record<string, string>> = {
  vi: {
    bot_ca_phe: 'Bột cà phê',
    nuoc_soi: 'Nước sôi',
    nuoc: 'Nước',
    duong: 'Đường',
    dau_nanh: 'Đậu nành',
    banh_mi: 'Bánh mì',
    thit_nguoi: 'Thịt nguội',
    do_chua: 'Đồ chua',
    tuong_ot: 'Tương ớt',
    hat_che: 'Hạt chè',
    nuoc_duong: 'Nước đường',
    da_vien: 'Đá viên',
    thit_xien: 'Thịt xiên',
    gia_vi: 'Gia vị',
    banh_bo_nguyen_lieu: 'Bánh bò',
    nuoc_cot_dua: 'Nước cốt dừa',
    soda: 'Soda',
    chanh: 'Chanh',
    ca_vien: 'Cá viên',
    dua_leo: 'Dưa leo',
    rau_que: 'Rau quế',
    muoi: 'Muối',
    tieu: 'Tiêu',
  },
  en: {
    bot_ca_phe: 'Coffee powder',
    nuoc_soi: 'Boiling water',
    nuoc: 'Water',
    duong: 'Sugar',
    dau_nanh: 'Soybeans',
    banh_mi: 'Bread',
    thit_nguoi: 'Cold cuts',
    do_chua: 'Pickled veggies',
    tuong_ot: 'Chili sauce',
    hat_che: 'Dessert beans',
    nuoc_duong: 'Sugar syrup',
    da_vien: 'Ice cubes',
    thit_xien: 'Skewer meat',
    gia_vi: 'Seasoning',
    banh_bo_nguyen_lieu: 'Banh bo',
    nuoc_cot_dua: 'Coconut milk',
    soda: 'Soda',
    chanh: 'Lime',
    ca_vien: 'Fish balls',
    dua_leo: 'Cucumber',
    rau_que: 'Basil',
    muoi: 'Salt',
    tieu: 'Pepper',
  },
};

export function getItemName(id: string): string {
  const lang = useGameStore.getState().settings.language;
  return ITEM_NAMES[lang][id] ?? ITEM_NAMES.vi[id] ?? id;
}

export function getIngredientName(id: string): string {
  const lang = useGameStore.getState().settings.language;
  return INGREDIENT_NAMES[lang][id] ?? INGREDIENT_NAMES.vi[id] ?? id;
}


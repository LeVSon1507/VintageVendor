import useGameStore from '../store/gameStore';

const REQ_MAP_EN: Record<string, string> = {
  'Ít đá': 'Less ice',
  'Thêm chanh': 'Extra lime',
  'Ướp lạnh': 'Chilled',
  'Không đá': 'No ice',
  'Ít muối': 'Less salt',
  'Không muối': 'No salt',
  'Ít gia vị': 'Less seasoning',
  'Cay': 'Spicy',
  'Ít tiêu': 'Less pepper',
  'Thêm tương ớt': 'Extra chili sauce',
  'Không cay': 'Not spicy',
  'Không rau': 'No greens',
  'Thêm dưa leo': 'Extra cucumber',
  'Ít tương ớt': 'Less chili sauce',
  'Thêm đồ chua': 'Extra pickles',
  'Ít ngọt': 'Less sweet',
  'Thêm đá': 'Extra ice',
  'Nóng': 'Hot',
  'Lạnh': 'Cold',
  'Nâu đá': 'Brown iced',
  'Đen đá': 'Black iced',
};

export function trReq(req: string): string {
  const lang = useGameStore.getState().settings.language;
  if (lang === 'en') {
    return REQ_MAP_EN[req] ?? req;
  }
  return req;
}


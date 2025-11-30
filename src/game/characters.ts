import { ImageSourcePropType } from 'react-native';

export type CharacterFrames = {
  walk: ImageSourcePropType[];
  idle: ImageSourcePropType;
};

export function getCharacterFrames(type: 'student' | 'worker' | 'elderly' | 'tourist'): CharacterFrames {
  if (type === 'student') {
    return {
      walk: [
        require('../assets/images/characters/hoc_sinh_di_1.webp'),
        require('../assets/images/characters/hoc_sinh_di_2.webp'),
        require('../assets/images/characters/hoc_sinh_di_3.webp'),
      ],
      idle: require('../assets/images/characters/hoc_sinh_dung_yen.webp'),
    };
  }

  if (type === 'worker') {
    return {
      walk: [
        require('../assets/images/characters/cong_nhan_di_1.webp'),
        require('../assets/images/characters/cong_nhan_di_2.webp'),
        require('../assets/images/characters/cong_nhan_di_3.webp'),
        require('../assets/images/characters/cong_nhan_di_4.webp'),
      ],
      idle: require('../assets/images/characters/cong_nhan_dung_yen.webp'),
    };
  }

  if (type === 'elderly') {
    return {
      walk: [
        require('../assets/images/characters/cu_gia_di_1.webp'),
        require('../assets/images/characters/cu_gia_di_2.webp'),
        require('../assets/images/characters/cu_gia_di_3.webp'),
      ],
      idle: require('../assets/images/characters/cu_gia_dung_yen.webp'),
    };
  }

  // tourist
  return {
    walk: [
      require('../assets/images/characters/co_gai_di_1.webp'),
      require('../assets/images/characters/co_gai_di_2.webp'),
      require('../assets/images/characters/co_gai_di_3.webp'),
      require('../assets/images/characters/co_gai_di_4.webp'),
    ],
    idle: require('../assets/images/characters/co_gai_dung_yen.webp'),
  };
}

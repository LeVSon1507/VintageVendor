import { ImageSourcePropType } from 'react-native';

export type CharacterFrames = {
  walk: ImageSourcePropType[];
  idle: ImageSourcePropType;
};

export function getCharacterFrames(type: 'student' | 'worker' | 'elderly' | 'tourist'): CharacterFrames {
  if (type === 'student') {
    return {
      walk: [
        require('../assets/images/characters/hoc_sinh_di_1.png'),
        require('../assets/images/characters/hoc_sinh_di_2.png'),
        require('../assets/images/characters/hoc_sinh_di_3.png'),
      ],
      idle: require('../assets/images/characters/hoc_sinh_dung_yen.png'),
    };
  }

  if (type === 'worker') {
    return {
      walk: [
        require('../assets/images/characters/cong_nhan_di_1.png'),
        require('../assets/images/characters/cong_nhan_di_2.png'),
        require('../assets/images/characters/cong_nhan_di_3.png'),
        require('../assets/images/characters/cong_nhan_di_4.png'),
      ],
      idle: require('../assets/images/characters/cong_nhan_dung_yen.png'),
    };
  }

  if (type === 'elderly') {
    let idle: ImageSourcePropType;
    try {
      idle = require('../assets/images/characters/cu_gia_dung_yen.png');
    } catch (_e) {
      try {
        idle = require('../assets/images/characters/cu_gia_dung_yen.png.png');
      } catch (_e2) {
        idle = require('../assets/images/characters/hoc_sinh_dung_yen.png');
      }
    }
    return {
      walk: [
        require('../assets/images/characters/cu_gia_di_1.png'),
        require('../assets/images/characters/cu_gia_di_2.png'),
        require('../assets/images/characters/cu_gia_di_3.png'),
      ],
      idle,
    };
  }

  // tourist
  return {
    walk: [
      require('../assets/images/characters/co_gai_di_1.png'),
      require('../assets/images/characters/co_gai_di_2.png'),
      require('../assets/images/characters/co_gai_di_3.png'),
      require('../assets/images/characters/co_gai_di_4.png'),
    ],
    idle: require('../assets/images/characters/co_gai_dung_yen.png'),
  };
}

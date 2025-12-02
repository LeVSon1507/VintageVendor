module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation/.*|react-clone-referenced-element))',
  ],
  setupFiles: ['react-native-gesture-handler/jestSetup'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(png|webp)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(mp3|ogg|wav)$': '<rootDir>/__mocks__/fileMock.js',
  },
};

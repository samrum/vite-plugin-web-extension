module.exports = {
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  clearMocks: true,
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};

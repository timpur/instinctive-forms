module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["src"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100
    }
  }
};

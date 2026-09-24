jest.mock('ioredis', () => {
  class MockRedis {
    constructor(url) {}
    on = jest.fn();
    once = jest.fn();
    connect = jest.fn();
    disconnect = jest.fn();
    quit = jest.fn();
  }
  return { __esModule: true, default: MockRedis };
});

export const Test = {
  createTestingModule(_opts: any) {
    let mockProvider: any;
    const builder = {
      overrideProvider(_provider: any) {
        return {
          useValue(value: any) {
            mockProvider = value;
            return {
              compile: async () => ({
                createNestApplication: () => ({
                  init: async () => {},
                  close: async () => {},
                  getHttpServer: () => {
                    const mockServer = {
                      listen: (portOrCallback?: any, callback?: any) => {
                        if (typeof portOrCallback === 'function') {
                          callback = portOrCallback;
                        }
                        if (callback) callback();
                        return mockServer;
                      },
                      address: () => ({ port: 0 }),
                      close: () => {},
                    };
                    return mockServer;
                  },
                }),
                get: <T>(_: any) => mockProvider as T,
              }),
            };
          },
        };
      },
    };
    return builder;
  },
};

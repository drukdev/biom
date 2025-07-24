module.exports = {
  FaceSdk: jest.fn().mockImplementation(() => {
    return {
      matchingApi: {
        match: jest.fn(),
      },
      personApi: {
        getPerson: jest.fn(),
        updatePerson: jest.fn(),
      },
      searchApi: {
        search: jest.fn(),
      },
    };
  }),
  ImageSource: {
    LIVE: 'live',
    EXTERNAL: 'external',
  },
};

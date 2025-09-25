require('@testing-library/jest-dom');

// Setup for React Testing Library
const { configure } = require('@testing-library/react');

configure({ testIdAttribute: 'data-testid' });

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';

// Mock external APIs
global.fetch = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
import { welcome } from './index';

jest.mock('expression-globals-typescript', () => ({
  Layer: jest.fn(),
  Comp: jest.fn(),
  Property: jest.fn(),
}));

test('returns correct welcome string', () => {
  expect(welcome('test')).toEqual('Welcome test!');
});

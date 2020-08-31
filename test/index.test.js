import createTestServer from 'create-test-server';
import request, { extend, fetch } from '../src/index';

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send(data);
};

describe('Test Basic Fetch:', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  it('test fecth no exist.', () => {});

  it('test invail fetch.', () => {});

  it('test fetch should return ok.', () => {});

  describe('test fetch method type.', () => {})
});
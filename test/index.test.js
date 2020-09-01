import createTestServer from 'create-test-server';
import request, { fetch } from '../src/index';

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

  it('fecth should no exist.', async (done) => {
    expect.assertions(1);
    server.post('/test/requestType', (req, res) => {
      writeData(req.body, res);
    });
    const oldFetch = window.fetch;
    window.fetch = null;
    try {
      await fetch(prefix('/test/requestType'), {
        method: 'post',
        requestType: 'json',
      });
    } catch (error) {
      expect(error.message).toBe('Global fetch not exist!');
      window.fetch = oldFetch;
      done();
    }
  });

  it('fetch should be invaild.', async (done) => {
    expect.assertions(1);
    server.get('/test/fetch', (req, res) => {
      setTimeout(() => {
        writeData('ok', res);
      }, 1000);
    });
    try {
      response = await fetch({ hello: 'hello' });
    } catch (error) {
      expect(error.message).toBe('url MUST be a string');
      done();
    }
  });

  it('fetch should return ok.', async (done) => {
    expect.assertions(1);
    server.get('/test/fetch', (req, res) => {
      setTimeout(() => {
        writeData('ok', res);
      }, 1000);
    });

    let response = await fetch(prefix('/test/fetch'));
    expect(response.ok).toBe(true);
    done();
  });
});

describe('Test Basic Request:', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(() => {
    server.close();
  });

  const prefix = api => `${server.url}${api}`;

  // 验证语法糖及普通请求
  it('request method type should all exist.', async () => {
    const METHODS = ['get', 'post', 'delete', 'put', 'patch', 'options'];
    METHODS.map(m => server[m]('/test/methodType', (req, res) => {
      writeData(req.method.toLowerCase(), res);
    }));

    expect.assertions(1);
    const allRequest = METHODS.map(m => request[m](prefix('/test/methodType')))
    const allResponse = await Promise.all(allRequest);
    expect(METHODS).toEqual(expect.arrayContaining(allResponse));
  });

  it('request header.accept should set */*.', async () => {
    server.post('/test/requestType', (req, res) => {
      writeData(req.headers, res);
    });

    const res = await request.post(prefix('/test/requestType'));
    expect(res.accept).toBe('*/*');    
  });

  it('request header.accept should set json.', async () => {
    server.post('/test/requestType', (req, res) => {
      writeData(req.headers, res);
    });
    const res = await request.post(prefix('/test/requestType'), { data: 'davnajvhav' });
    expect(res.accept).toBe('application/json');
  });

  it('request header.contentType should set charset', async () => {
    server.post('/test/requestType', (req, res) => {
      writeData(req.headers, res);
    });
    const res = await request.post(prefix('/test/requestType'), { data: { hello: 'world' }});
    expect(res['content-type']).toBe('application/json;charset=UTF-8');
  });

  it('request header.contentType should set x-www-form', async () => {
    server.post('/test/requestType', (req, res) => {
      writeData(req.headers, res);
    });
    const res = await request.post(prefix('/test/requestType'), { data: { hello: 'world' }, requestType: 'form' });
    expect(res['content-type']).toBe('application/x-www-form-urlencoded;charset=UTF-8');
  });
});
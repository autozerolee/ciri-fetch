import requestType from '../../src/middleware/requestType';
const next = () => {};

describe('Test RequestType Middleware:', () => {
  it('should do nothing when ctx is null', async done => {
    const ctx = null;
    await requestType(ctx, next);
    expect(ctx).toBe(null);
    done();
  });
});

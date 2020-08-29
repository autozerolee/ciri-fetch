import { MapCache, getEnv } from '../src/util';

describe('test utils:', () => {
  describe('test cache', () => {
    it('test timeout', async done => {
      const mapCache = new MapCache({ maxCache: 3 });

      const key = { some: 'one' };
      mapCache.set(key, { hello: 'world1' }, 1000);
      expect(mapCache.get(key).hello).toBe('world1');

      setTimeout(() => {
        expect(mapCache.get(key)).toBe(undefined);
        done();
      }, 1001);
    });
    it('test delete', () => {
      const mapCache = new MapCache({ maxCache: 3 });

      const key2 = { other: 'two' };
      mapCache.set(key2, { hello: 'world1' }, 10000);
      mapCache.delete(key2);
      expect(mapCache.get(key2)).toBe(undefined);
    });
    it('test clear', () => {
      const mapCache = new MapCache({ maxCache: 3 });
      const key3 = { other: 'three' };
      mapCache.set(key3, { hello: 'world1' }, 10000);
      mapCache.clear();
    });
    it('test max cache', () => {
      const mapCache = new MapCache({ maxCache: 3 });

      mapCache.set('max1', { what: 'ok' });
      mapCache.set('max1', { what: 'ok1' });
      mapCache.set('max2', { what: 'ok2' });
      mapCache.set('max3', { what: 'ok3' });

      expect(mapCache.get('max1').what).toBe('ok1');

      // 超出限制删除顶部第一个
      mapCache.set('max4', { what: 'ok4' });
      expect(mapCache.get('max1')).toBe(undefined);
    })
    it('test max cache', () => {
      const mapCache = new MapCache({ maxCache: 3 });

      // 测试超过最大数
      mapCache.set('max1', { what: 'ok' });
      mapCache.set('max1', { what: 'ok1' });
      mapCache.set('max2', { what: 'ok2' });
      mapCache.set('max3', { what: 'ok3' });
      expect(mapCache.get('max1').what).toBe('ok1');
      mapCache.set('max4', { what: 'ok4' });
      mapCache.set('max5', { what: 'ok5' });
      mapCache.set('max6', { what: 'ok6' });
      expect(mapCache.get('max3')).toBe(undefined);
    });
  });
  describe('test getEnv', () => {
    it('should return BROWSER', done => {
      const env = getEnv();
      expect(env).toBe('BROWSER');
      done();
    });
  });
});
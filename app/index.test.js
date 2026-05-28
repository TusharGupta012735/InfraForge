const request = require('supertest');
const app = require('./index');

describe('sample app', () => {
  test('GET / returns status ok', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /metrics returns prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('process_cpu_user_seconds_total');
  });
});

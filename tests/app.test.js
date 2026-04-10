const request = require('supertest');
const app = require('../src/app');

describe('StudyOS Application Core Tests', () => {
  it('should successfully hit the root health check endpoint', async () => {
    const res = await request(app).get('/health');
    
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('should successfully hit the API health check endpoint', async () => {
    const res = await request(app).get('/api/v1/health');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('StudyOS API is running');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-test-route');
    
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('ROUTE_NOT_FOUND');
  });
});

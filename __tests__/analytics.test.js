import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb } from './helpers/db.js';

let authToken;
const testUser = { name: 'Analytics User', email: 'analytics@test.com', password: 'Analytics@123' };

beforeAll(async () => {
  await connectTestDb();
  const signUp = await request(app).post('/api/v1/auth/sign-up').send(testUser);
  authToken = signUp.body.data.token;

  // Create two subscriptions: one Monthly (100 INR), one Yearly (1200 INR)
  // Monthly normalized: 100 * 1 = 100
  // Yearly normalized: 1200 * 0.0833 = 99.96
  // Expected totalMonthlySpend: 199.96
  await request(app)
    .post('/api/v1/subscriptions')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: 'Spotify',
      price: 100,
      currency: 'INR',
      duration: 'Monthly',
      category: 'Standard',
      paymentMethod: 'UPI',
      startDate: new Date(Date.now() + 86400000).toISOString(),
    });

  await request(app)
    .post('/api/v1/subscriptions')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: 'Amazon Prime',
      price: 1200,
      currency: 'INR',
      duration: 'Yearly',
      category: 'Premium',
      paymentMethod: 'Credit Card',
      startDate: new Date(Date.now() + 86400000).toISOString(),
    });
});

afterAll(async () => {
  await disconnectTestDb();
});

describe('Analytics & RBAC Endpoints', () => {
  describe('GET /api/v1/subscriptions/analytics/summary', () => {
    it('should return correct top-level summary structure and mathematically normalized monthly spend', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions/analytics/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('byCategory');
      expect(res.body.data).toHaveProperty('byCurrency');
      expect(res.body.data).toHaveProperty('mostExpensive');
      expect(res.body.data).toHaveProperty('nextRenewal');

      const { summary } = res.body.data;
      expect(summary.totalActiveSubscriptions).toBe(2);
      // 100 + (1200 * 0.0833) = 199.96
      expect(summary.estimatedMonthlySpend).toBeCloseTo(199.96, 1);
      expect(summary.estimatedYearlySpend).toBeCloseTo(199.96 * 12, 0);
    });
  });

  describe('GET /api/v1/subscriptions/analytics/monthly-trend', () => {
    it('should return monthly trend array with YYYY-MM period format', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions/analytics/monthly-trend?months=6')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('trend');
      expect(Array.isArray(res.body.data.trend)).toBe(true);
      expect(res.body.data.trend.length).toBeGreaterThan(0);

      const firstItem = res.body.data.trend[0];
      expect(firstItem).toHaveProperty('period');
      expect(firstItem.period).toMatch(/^\d{4}-\d{2}$/);
      expect(firstItem).toHaveProperty('subscriptionsAdded');
      expect(firstItem).toHaveProperty('totalSpendAdded');
    });
  });

  describe('GET /api/v1/subscriptions (Admin only RBAC check)', () => {
    it('should return 403 Forbidden for a standard user', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Admin access required');
    });
  });

  describe('GET /api/v1/subscriptions/upcoming-renewals', () => {
    it('should return user active upcoming renewals with daysUntilRenewal', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions/upcoming-renewals?days=60')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('subscriptions');
      expect(res.body.data.count).toBeGreaterThan(0);
      expect(res.body.data.subscriptions[0]).toHaveProperty('daysUntilRenewal');
    });
  });
});

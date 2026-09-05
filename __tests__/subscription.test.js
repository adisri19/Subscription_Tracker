import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb } from './helpers/db.js';

let authToken;
let subscriptionId;
const testUser = { name: 'Sub User', email: 'subuser@test.com', password: 'SubTest@123' };

beforeAll(async () => {
  await connectTestDb();
  const signUp = await request(app).post('/api/v1/auth/sign-up').send(testUser);
  authToken = signUp.body.data.token;
});

afterAll(async () => {
  await disconnectTestDb();
});

const validSubscription = {
  name: 'Netflix',
  price: 649,
  currency: 'INR',
  duration: 'Monthly',
  category: 'Standard',
  paymentMethod: 'UPI',
  startDate: new Date(Date.now() + 86400000).toISOString(),
};

describe('Subscription Endpoints', () => {
  describe('POST /api/v1/subscriptions', () => {
    it('should create a subscription', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validSubscription);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subscription).toHaveProperty('_id');
      expect(res.body.data.subscription.name).toBe('Netflix');
      subscriptionId = res.body.data.subscription._id;
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions')
        .send(validSubscription);
      expect(res.statusCode).toBe(401);
    });

    it('should return 400 for invalid data (price negative)', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validSubscription, price: -10 });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/subscriptions/:id', () => {
    it('should fetch subscription by id', async () => {
      const res = await request(app)
        .get(`/api/v1/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(subscriptionId);
      expect(res.body.data.name).toBe('Netflix');
    });

    it('should return 400 for invalid ObjectId', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions/not-a-valid-id')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/subscriptions/:id/cancel', () => {
    it('should cancel a subscription and set renewalDate to null', async () => {
      const res = await request(app)
        .put(`/api/v1/subscriptions/${subscriptionId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('Cancelled');
      expect(res.body.data.renewalDate).toBeNull();
    });

    it('should return 400 if already cancelled', async () => {
      const res = await request(app)
        .put(`/api/v1/subscriptions/${subscriptionId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(400);
    });
  });
});

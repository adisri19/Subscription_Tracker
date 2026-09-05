import request from 'supertest';
import app from '../app.js';
import { connectTestDb, disconnectTestDb } from './helpers/db.js';

let authToken;
let testUserId;

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/sign-up', () => {
    it('should create a new user and return a token without password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-up')
        .send({ name: 'Test User', email: 'test@example.com', password: 'Password@123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.user.email).toBe('test@example.com');

      authToken = res.body.data.token;
      testUserId = res.body.data.user._id;
    });

    it('should return 400 if user already exists', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-up')
        .send({ name: 'Test User', email: 'test@example.com', password: 'Password@123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-up')
        .send({ name: 'Test', email: 'not-an-email', password: 'Password@123' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/sign-in', () => {
    it('should sign in and return a token without password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({ email: 'test@example.com', password: 'Password@123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).not.toHaveProperty('password');
      authToken = res.body.data.token;
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({ email: 'test@example.com', password: 'WrongPass@999' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/sign-out', () => {
    it('should sign out and reject subsequent requests with the blacklisted token', async () => {
      const signOutRes = await request(app)
        .post('/api/v1/auth/sign-out')
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(signOutRes.statusCode).toBe(200);
      expect(signOutRes.body.success).toBe(true);

      const protectedRes = await request(app)
        .get('/api/v1/subscriptions/upcoming-renewals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(protectedRes.statusCode).toBe(401);
    });
  });
});

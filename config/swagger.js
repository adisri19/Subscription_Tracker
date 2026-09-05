import swaggerJsdoc from 'swagger-jsdoc';
import { PORT } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Subscription Tracker API',
      version: '1.0.0',
      description: 'REST API for tracking subscriptions with automated email reminders',
      contact: { name: 'API Support' },
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Current server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Subscription: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '664a3f890123456789abcdef' },
            name: { type: 'string', example: 'Netflix' },
            price: { type: 'number', example: 649 },
            currency: { type: 'string', enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'], example: 'INR' },
            duration: { type: 'string', enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'], example: 'Monthly' },
            category: { type: 'string', enum: ['Basic', 'Standard', 'Premium'], example: 'Standard' },
            paymentMethod: { type: 'string', example: 'UPI' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Cancelled'], example: 'Active' },
            startDate: { type: 'string', format: 'date-time', example: '2026-09-01T00:00:00.000Z' },
            renewalDate: { type: 'string', format: 'date-time', nullable: true, example: '2026-10-01T00:00:00.000Z' },
            userId: { type: 'string', example: '664a3f890123456789abc000' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '664a3f890123456789abc000' },
            name: { type: 'string', example: 'Aditya' },
            email: { type: 'string', example: 'aditya@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message description' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters').trim(),
  price: z.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR']).default('INR'),
  duration: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']).default('Monthly'),
  category: z.enum(['Basic', 'Standard', 'Premium']).default('Standard'),
  paymentMethod: z.enum(['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'UPI']),
  status: z.enum(['Active', 'Inactive', 'Cancelled']).default('Active').optional(),
  startDate: z.coerce.date(),
  renewalDate: z.coerce.date().optional(),
});

export const updateSubscriptionSchema = z.object({
  name: z.string().min(3).max(50).trim().optional(),
  price: z.number().min(0).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR']).optional(),
  category: z.enum(['Basic', 'Standard', 'Premium']).optional(),
  paymentMethod: z.enum(['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'UPI']).optional(),
  status: z.enum(['Active', 'Inactive', 'Cancelled']).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field must be provided' });

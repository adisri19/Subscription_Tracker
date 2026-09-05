import { Router } from "express";
import authorize, { authorizeAdmin } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createSubscriptionSchema,
    updateSubscriptionSchema,
} from "../validators/subscription.validator.js";
import {
    cancelSubscription,
    createSubscription,
    deleteSubscription,
    getAllSubscriptions,
    getAnalyticsSummary,
    getMonthlyTrend,
    getSubscriptionById,
    getUpcomingRenewals,
    getUserSubscriptions,
    updateSubscription,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription management, reminders, and spending analytics
 */

/**
 * @swagger
 * /api/v1/subscriptions/analytics/summary:
 *   get:
 *     summary: Get overall subscription spending analytics summary
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Spending analytics summary
 *       401:
 *         description: Unauthorized
 */
subscriptionRouter.get('/analytics/summary', authorize, getAnalyticsSummary);

/**
 * @swagger
 * /api/v1/subscriptions/analytics/monthly-trend:
 *   get:
 *     summary: Get monthly spending trend for past N months
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of months to analyze (max 12)
 *     responses:
 *       200:
 *         description: Monthly trend data
 */
subscriptionRouter.get('/analytics/monthly-trend', authorize, getMonthlyTrend);

/**
 * @swagger
 * /api/v1/subscriptions/upcoming-renewals:
 *   get:
 *     summary: Get user's upcoming active subscription renewals
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Upcoming renewal window in days (max 365)
 *     responses:
 *       200:
 *         description: List of upcoming renewals
 */
subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);

/**
 * @swagger
 * /api/v1/subscriptions/user/{id}:
 *   get:
 *     summary: Get paginated subscriptions for a specific user
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated user subscriptions
 *       403:
 *         description: Forbidden
 */
subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

/**
 * @swagger
 * /api/v1/subscriptions:
 *   get:
 *     summary: Get all subscriptions across users (Admin only)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: duration
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated subscriptions
 *       403:
 *         description: Admin access required
 */
subscriptionRouter.get('/', authorize, authorizeAdmin, getAllSubscriptions);

/**
 * @swagger
 * /api/v1/subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, paymentMethod, startDate]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Netflix
 *               price:
 *                 type: number
 *                 example: 649
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GBP, JPY, CNY, INR]
 *                 example: INR
 *               duration:
 *                 type: string
 *                 enum: [Daily, Weekly, Monthly, Quarterly, Yearly]
 *                 example: Monthly
 *               category:
 *                 type: string
 *                 enum: [Basic, Standard, Premium]
 *                 example: Standard
 *               paymentMethod:
 *                 type: string
 *                 example: UPI
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Cancelled]
 *                 example: Active
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-09-01T00:00:00.000Z'
 *               renewalDate:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-10-01T00:00:00.000Z'
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Validation error
 */
subscriptionRouter.post('/', authorize, validate(createSubscriptionSchema), createSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   get:
 *     summary: Get single subscription by ID
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *       400:
 *         description: Invalid subscription ID format
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subscription not found
 */
subscriptionRouter.get('/:id', authorize, getSubscriptionById);

/**
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   put:
 *     summary: Update subscription details
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GBP, JPY, CNY, INR]
 *               category:
 *                 type: string
 *                 enum: [Basic, Standard, Premium]
 *               paymentMethod:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Cancelled]
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *       400:
 *         description: Invalid input or ID
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subscription not found
 */
subscriptionRouter.put('/:id', authorize, validate(updateSubscriptionSchema), updateSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   delete:
 *     summary: Delete a subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Subscription deleted successfully
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subscription not found
 */
subscriptionRouter.delete('/:id', authorize, deleteSubscription);

/**
 * @swagger
 * /api/v1/subscriptions/{id}/cancel:
 *   put:
 *     summary: Cancel an active subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       400:
 *         description: Subscription is already cancelled
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Subscription not found
 */
subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription);

export default subscriptionRouter;



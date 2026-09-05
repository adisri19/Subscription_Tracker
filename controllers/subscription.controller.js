import mongoose from "mongoose";
import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";

export const createSubscription = async (req, res, next) => {
    try {
        const newSubscription = await Subscription.create({
            ...req.body,
            userId: req.user,
        });

        let workflowRunId = null;

        try {
            const workflowRun = await workflowClient.trigger({
                url: `${SERVER_URL}/api/v1/workflow/subscription/reminder`,
                body: {
                    subscriptionId: newSubscription._id.toString()
                },
                headers: {
                    "content-type": "application/json"
                },
                retries: 0
            });

            workflowRunId = workflowRun.workflowRunId;
        } catch (workflowError) {
            if (process.env.NODE_ENV !== 'test') {
                console.error("Failed to schedule subscription reminder:", workflowError.message);
            }
        }

        res.status(201).json({
            success: true,
            data: {
                subscription: newSubscription,
                workflowRunId
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllSubscriptions = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            currency,
            category,
            duration,
            sortBy = 'createdAt',
            order = 'desc',
        } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (currency) filter.currency = currency;
        if (category) filter.category = category;
        if (duration) filter.duration = duration;

        const skip = (Number(page) - 1) * Number(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        const [subscriptions, total] = await Promise.all([
            Subscription.find(filter)
                .populate('userId', 'name email')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(Number(limit)),
            Subscription.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                subscriptions,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit)),
                    hasNextPage: skip + subscriptions.length < total,
                    hasPrevPage: Number(page) > 1,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getSubscriptionById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid subscription ID format' });
        }

        const subscription = await Subscription.findById(req.params.id).populate('userId', 'name email');

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        const ownerId = subscription.userId?._id
            ? subscription.userId._id.toString()
            : subscription.userId.toString();

        if (ownerId !== req.user && req.userRole !== 'admin') {
            return res.status(403).json({ success: false, error: 'Forbidden: you do not own this subscription' });
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

export const updateSubscription = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid subscription ID format' });
        }

        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        if (subscription.userId.toString() !== req.user) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const allowedUpdates = ['name', 'price', 'currency', 'category', 'paymentMethod', 'status'];
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => { obj[key] = req.body[key]; return obj; }, {});

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields provided for update' });
        }

        Object.assign(subscription, updates);

        if (updates.status === 'Cancelled') {
            subscription.renewalDate = null;
        }

        await subscription.save();

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

export const deleteSubscription = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid subscription ID format' });
        }

        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        if (subscription.userId.toString() !== req.user && req.userRole !== 'admin') {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        await Subscription.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const cancelSubscription = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid subscription ID format' });
        }

        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({ success: false, error: 'Subscription not found' });
        }

        if (subscription.userId.toString() !== req.user) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        if (subscription.status === 'Cancelled') {
            return res.status(400).json({ success: false, error: 'Subscription is already cancelled' });
        }

        subscription.status = 'Cancelled';
        subscription.renewalDate = null;
        await subscription.save();

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription,
        });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingRenewals = async (req, res, next) => {
    try {
        const days = Math.min(parseInt(req.query.days) || 30, 365);
        const now = new Date();
        const futureDate = dayjs().add(days, 'day').toDate();

        const subscriptions = await Subscription.find({
            userId: req.user,
            status: 'Active',
            renewalDate: { $gte: now, $lte: futureDate },
        }).sort({ renewalDate: 1 });

        const enriched = subscriptions.map(sub => ({
            ...sub.toObject(),
            daysUntilRenewal: dayjs(sub.renewalDate).diff(dayjs(), 'day'),
        }));

        res.status(200).json({
            success: true,
            data: {
                count: enriched.length,
                windowDays: days,
                subscriptions: enriched,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (req.user !== req.params.id && req.userRole !== 'admin') {
            const error = new Error("You are not the owner of this account");
            error.statusCode = 403;
            throw error;
        }

        const {
            page = 1,
            limit = 10,
            status,
            category,
            currency,
            sortBy = 'createdAt',
            order = 'desc',
        } = req.query;

        const filter = { userId: req.params.id };
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (currency) filter.currency = currency;

        const skip = (Number(page) - 1) * Number(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        const [subscriptions, total] = await Promise.all([
            Subscription.find(filter)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(Number(limit)),
            Subscription.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: {
                subscriptions,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit)),
                    hasNextPage: skip + subscriptions.length < total,
                    hasPrevPage: Number(page) > 1,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getAnalyticsSummary = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user);

        const normalizationFactors = {
            Daily: 30,
            Weekly: 4.33,
            Monthly: 1,
            Quarterly: 0.333,
            Yearly: 0.0833,
        };

        const pipeline = [
            { $match: { userId, status: 'Active' } },
            {
                $addFields: {
                    monthlyEquivalent: {
                        $switch: {
                            branches: Object.entries(normalizationFactors).map(([dur, factor]) => ({
                                case: { $eq: ['$duration', dur] },
                                then: { $multiply: ['$price', factor] },
                            })),
                            default: '$price',
                        },
                    },
                },
            },
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalSubscriptions: { $sum: 1 },
                                totalMonthlySpend: { $sum: '$monthlyEquivalent' },
                                totalYearlySpend: { $sum: { $multiply: ['$monthlyEquivalent', 12] } },
                            },
                        },
                    ],
                    byCategory: [
                        {
                            $group: {
                                _id: '$category',
                                count: { $sum: 1 },
                                monthlySpend: { $sum: '$monthlyEquivalent' },
                            },
                        },
                        { $sort: { monthlySpend: -1 } },
                    ],
                    byCurrency: [
                        {
                            $group: {
                                _id: '$currency',
                                count: { $sum: 1 },
                                totalMonthlySpend: { $sum: '$monthlyEquivalent' },
                            },
                        },
                    ],
                    mostExpensive: [
                        { $sort: { price: -1 } },
                        { $limit: 1 },
                        { $project: { name: 1, price: 1, currency: 1, duration: 1 } },
                    ],
                    nextRenewal: [
                        {
                            $match: {
                                renewalDate: { $gte: new Date() },
                            },
                        },
                        { $sort: { renewalDate: 1 } },
                        { $limit: 1 },
                        { $project: { name: 1, renewalDate: 1, price: 1, currency: 1 } },
                    ],
                },
            },
        ];

        const [result] = await Subscription.aggregate(pipeline);

        const summary = result?.summary?.[0] || { totalSubscriptions: 0, totalMonthlySpend: 0, totalYearlySpend: 0 };

        const formattedByCategory = (result?.byCategory || []).map(item => ({
            category: item._id,
            count: item.count,
            monthlySpend: parseFloat(Number(item.monthlySpend).toFixed(2)),
        }));

        const formattedByCurrency = (result?.byCurrency || []).map(item => ({
            currency: item._id,
            count: item.count,
            totalMonthlySpend: parseFloat(Number(item.totalMonthlySpend).toFixed(2)),
        }));

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalActiveSubscriptions: summary.totalSubscriptions,
                    estimatedMonthlySpend: parseFloat(Number(summary.totalMonthlySpend).toFixed(2)),
                    estimatedYearlySpend: parseFloat(Number(summary.totalYearlySpend).toFixed(2)),
                },
                byCategory: formattedByCategory,
                byCurrency: formattedByCurrency,
                mostExpensive: result?.mostExpensive?.[0] || null,
                nextRenewal: result?.nextRenewal?.[0] || null,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getMonthlyTrend = async (req, res, next) => {
    try {
        const months = Math.min(parseInt(req.query.months) || 6, 12);
        const userId = new mongoose.Types.ObjectId(req.user);
        const startDate = dayjs().subtract(months, 'month').startOf('month').toDate();

        const pipeline = [
            {
                $match: {
                    userId,
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    subscriptionsAdded: { $sum: 1 },
                    totalSpendAdded: { $sum: '$price' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            {
                $project: {
                    _id: 0,
                    period: {
                        $concat: [
                            { $toString: '$_id.year' },
                            '-',
                            {
                                $cond: [
                                    { $lt: ['$_id.month', 10] },
                                    { $concat: ['0', { $toString: '$_id.month' }] },
                                    { $toString: '$_id.month' },
                                ],
                            },
                        ],
                    },
                    subscriptionsAdded: 1,
                    totalSpendAdded: { $round: ['$totalSpendAdded', 2] },
                },
            },
        ];

        const trend = await Subscription.aggregate(pipeline);

        res.status(200).json({
            success: true,
            data: { months, trend },
        });
    } catch (error) {
        next(error);
    }
};



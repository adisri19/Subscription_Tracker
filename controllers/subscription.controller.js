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

export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (req.user !== req.params.id && req.userRole !== 'admin') {
            const error = new Error("You are not the owner of this account");
            error.statusCode = 403;
            throw error;
        }

        const subscriptions = await Subscription.find({ userId: req.params.id });

        res.status(200).json({
            success: true,
            data: subscriptions
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

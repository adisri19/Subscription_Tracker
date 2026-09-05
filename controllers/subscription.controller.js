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

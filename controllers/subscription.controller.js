import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";

export const createSubscription = async (req, res, next) => {
    try {
        const {
            name,
            price,
            currency,
            duration,
            frequency,
            category,
            paymentmethod,
            paymentMethod,
            status,
            startdate,
            startDate,
            renewaldate,
            renewalDate
        } = req.body;

        const normalizedSubscription = {
            name,
            price,
            currency,
            duration: duration || frequency,
            category,
            paymentmethod: paymentmethod || paymentMethod,
            status,
            startdate: startdate || startDate,
            renewaldate: renewaldate || renewalDate,
            userID: req.user
        };

        const newSubscription = await Subscription.create(normalizedSubscription);

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
            console.error("Failed to schedule subscription reminder:", workflowError.message);
        }

        const subscriptionResponse = {
            ...newSubscription.toObject(),
            frequency: newSubscription.duration,
            paymentMethod: newSubscription.paymentmethod,
            startDate: newSubscription.startdate,
            renewalDate: newSubscription.renewaldate,
            user: newSubscription.userID
        };

        delete subscriptionResponse.duration;
        delete subscriptionResponse.paymentmethod;
        delete subscriptionResponse.startdate;
        delete subscriptionResponse.renewaldate;
        delete subscriptionResponse.userID;

        res.status(201).json({
            success: true,
            data: {
                subscription: subscriptionResponse,
                workflowRunId
            }
        });
    } catch (error) {
        if (typeof next === "function") {
            return next(error);
        }
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || "Server Error"
        });
    }
};
export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (req.user !== req.params.id) {
            const error = new Error("You are not the owner of this account");
            error.statusCode = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ userID: req.params.id });

        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        if (typeof next === "function") {
            return next(error);
        }
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || "Server Error"
        });
    }
};

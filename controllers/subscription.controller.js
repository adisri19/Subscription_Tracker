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
            category,
            paymentmethod,
            status,
            startdate,
            renewaldate
        } = req.body;

        const newSubscription = await Subscription.create({
            name,
            price,
            currency,
            duration,
            category,
            paymentmethod,
            status,
            startdate,
            renewaldate,
            userID: req.user
        });

        await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflow/subscription/reminder`,
            body: {
                subscriptionId: newSubscription._id.toString()
            },
            headers: {
                "content-type": "application/json"
            },
            retries: 0
        });

        res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            data: newSubscription
        });
    } catch (error) {
        next(error);
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
        next(error);
    }
};

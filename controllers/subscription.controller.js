import subscription from "../models/subscription.model.js";

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
            renewaldate,
            userID
        } = req.body;

        const newSubscription = await subscription.create({
            name,
            price,
            currency,
            duration,
            category,
            paymentmethod,
            status,
            startdate,
            renewaldate,
            userID
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

        const subscriptions = await subscription.find({ userID: req.params.id });

        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        next(error);
    }
};

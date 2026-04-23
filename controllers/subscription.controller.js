import subscription from "../models/subscription.model.js";

export const createSubscription = async (req, res, next) => {
    try {
        const { name, price, billingCycle } = req.body;
        const newSubscription = await subscription.create({ name, price, billingCycle });
        res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            data: newSubscription
        });
    } catch (error) {
        next(error);
    }
};
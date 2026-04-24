import dayjs from "dayjs";
import { serve } from "@upstash/workflow/express";
import Subscription from "../models/subscription.model.js";

const REMINDERS = [7, 5, 2, 1];

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run("get subscription", async () => {
        return Subscription.findById(subscriptionId).populate("userID", "name email");
    });
};

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date.toISOString()}`);
    await context.sleepUntil(`sleep until ${label} reminder`, date.toDate());
};

const triggerReminder = async (context, label, subscriptionId) => {
    return await context.run(`trigger ${label} reminder`, async () => {
        console.log(`Triggering ${label} reminder for subscription ${subscriptionId}`);
    });
};

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;

    if (!subscriptionId) {
        console.log("No subscriptionId provided. Stopping workflow.");
        return;
    }

    const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== "Active") {
        return;
    }

    const renewalDate = dayjs(subscription.renewaldate);

    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const label = `${daysBefore}-day`;
        const reminderDate = renewalDate.subtract(daysBefore, "day");

        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, label, reminderDate);
        }

        await triggerReminder(context, label, subscriptionId);
    }
});

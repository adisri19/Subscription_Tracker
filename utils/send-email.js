import dayjs from 'dayjs';
import transporter,{ accountEmail } from '../config/nodemailer.js';
import { SERVER_URL } from '../config/env.js';
import { generateEmailTemplate } from './email-template.js';

export const sendReminderEmail= async ({ to, type, subscription }) => {
    if(!to || !type || !subscription) {
        throw new Error('Missing required parameters: to, type and subscription are required');
    }

    const user = subscription.userID || subscription.user;
    const daysLeft = Number.parseInt(type, 10) || dayjs(subscription.renewaldate).diff(dayjs(), 'day');
    const mailInfo = {
        userName: user?.name || 'there',
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewaldate).format('MMMM D, YYYY'),
        planName: subscription.category,
        price: `${subscription.price} ${subscription.currency} (${subscription.duration})`,
        paymentMethod: subscription.paymentmethod,
        accountSettingsLink: `${SERVER_URL}/subscriptions`,
        supportLink: `${SERVER_URL}/support`,
        daysLeft,
    }

    const message = generateEmailTemplate(mailInfo);
    const subject = `${subscription.name} renews in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
    const emailOptions = {
        from:accountEmail,
        to:to,
        subject:subject,
        html:message
    }

    await transporter.sendMail(emailOptions);
    return emailOptions;
}

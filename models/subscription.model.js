import mongoose from "mongoose";
import dayjs from "dayjs";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription name not defined'],
        trim: true,
        minLength: [3, 'Subscription name must be at least 3 characters long'],
        maxLength: [50, 'Subscription name must be less than 50 characters long']       
    },
    price: {
        type: Number,
        required: [true, 'Subscription price not defined'],
        min: [0, 'Subscription price must be a positive number']
    }, 
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'],
        default: 'INR'
    },
    duration: {
        type: String,
        enum: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"],
        default: 'Monthly'
    },
    category: {
        type: String,
        enum: ["Basic", "Standard", "Premium"],
        default: 'Standard'
    },
    paymentMethod: {
        type: String,
        enum: ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "UPI"],
        default: 'Credit Card',
        required: [true, 'Subscription payment method not defined'],
        trim: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Cancelled"],
        default: 'Active'
    },
    startDate: {
        type: Date,
        required: [true, 'Subscription start date not defined'],
        validate: {
            validator: (value) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return value >= today;
            },
            message: 'Start date cannot be in the past'
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function(value) {
                if (!value) return true;
                return value > this.startDate;
            },
            message: 'Subscription renewal date must be after the start date'
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Subscription user ID not defined'],
        index: true
    }
}, {
    timestamps: true
});

subscriptionSchema.pre('save', function() {    
    const renewalPeriodMap = {
        Daily: { amount: 1, unit: 'day' },
        Weekly: { amount: 1, unit: 'week' },
        Monthly: { amount: 1, unit: 'month' },
        Quarterly: { amount: 3, unit: 'month' },
        Yearly: { amount: 1, unit: 'year' },
    };

    if (!this.renewalDate && this.status !== 'Cancelled') {
        const period = renewalPeriodMap[this.duration];
        if (period && this.startDate) {
            this.renewalDate = dayjs(this.startDate).add(period.amount, period.unit).toDate();
        }
    }

    // if renewal date has passed, set status to inactive
    if (this.renewalDate && this.renewalDate < new Date()) {
        this.status = 'Inactive';
    }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;


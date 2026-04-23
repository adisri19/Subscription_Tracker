import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription name not defined'],
        trim: true,
        minLength: [3, 'Subscription name must be at least 3 characters long'],
        maxLength: [50, 'Subscription name must be less than 50 characters long']       
    },
    price:{
        type: Number,
        required: [true, 'Subscription price not defined'],
        min: [0, 'Subscription price must be a positive number']
    }, 
    currency:{
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY' ,'INR'],
        default:'INR'
    },
    duration:{
        type: String,
        enum: ["Daily","Weekly","Monthly", "Quarterly", "Yearly"],
        default:'Monthly'
    },
    category:{
        type: String,
        enum: ["Basic", "Standard", "Premium"],
        default:'Standard'
    },
    paymentmethod:{
        type: String,
        enum: ["Credit Card", "Debit Card", "PayPal", "Bank Transfer","UPI"],
        default:'Credit Card',
        required: [true, 'Subscription payment method not defined'],
        trim: true
    },
    status:{
        type: String,
        enum: ["Active", "Inactive", "Cancelled"],
        default:'Active'
    },
    startdate:{
        type: Date,
        required: [true, 'Subscription start date not defined'],
        validate: {
        validator:(value)=>value >= new Date(),
        message:'Subscription start date must be in the future'
        }
    },
    renewaldate:{
        type: Date,
        required: [true, 'Subscription renewal date not defined'],
        validate: {
        validator:function(value){
            return value > this.startdate;
        },
        message:'Subscription renewal date must be after the start date'
        }
    },
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Subscription user ID not defined'],
        index: true
    }
},  {
    timestamps: true
});

subscriptionSchema.pre('save', function(next){    
    if(!this.renewaldate){
        const renewalPeriods = {
            "Daily": 1,
            "Weekly": 7,
            "Monthly": 30,
            "Quarterly": 90,
            "Yearly": 365
        };
        this.renewaldate= new Date(this.startdate);
        this.renewaldate.setDate(this.renewaldate.getDate() + renewalPeriods[this.duration]);
    }
    //if renewal date has passed , set status to inactive
    if(this.renewaldate < new Date()){
        this.status = 'Inactive';
    }
    next();
});
const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;

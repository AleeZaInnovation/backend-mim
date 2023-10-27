import mongoose from "mongoose";
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter client name!'],
        minLength: [4, 'Name must be at least 4 characters'],
        mixLength: [80, 'Name must be at most 80 characters'],
    },
    address: {
        type: String,
        required: [true, 'Please enter client address!'],
    },
    mobile: {
        type: String,
        required: [true, 'Please enter client mobile number!'],
    },
    description: {
        type: String,
        required: false,
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
            required: false,
        },
    },
    category: {
        type: String,
        required: true,
    },
    rate: {
        type: Number,
        default: 0,
    },
    balance: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Party = mongoose.model("Party", schema);
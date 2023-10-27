import mongoose from "mongoose";
const schema = new mongoose.Schema({
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
        },
    },
    debit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
    },
    credit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
    },
    balance: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        default: 0,
    },
    transactionType: {
        type: String,
        default: "Received"
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Transaction = mongoose.model("Transaction", schema);
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Transaction } from "../models/Transaction.js";
import { Party } from "../models/Party.js";
import { User } from "../models/User.js";
import { getDataUri } from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import { Stats } from "../models/Stats.js"


export const getAllTransaction = catchAsyncError(async (req, res, next) => {

    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const transactions = await Transaction.find({

    }).populate('debit').populate('credit');
    res.status(200).json({
        success: true,
        transactions,
    });
});

export const createTransaction = catchAsyncError(async (req, res, next) => {
    const createdBy = req.user.name
    const { description, debit, credit, balance, createdAt, quantity, transactionType } = req.body;
    if (!debit || !credit || !balance || !createdAt)
        return next(new ErrorHandler("Please add all fields", 400));

    const file = req.file;
    if (file) {
        const fileUri = getDataUri(file)

        var myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    }
    const transaction = await Transaction.create({
        description,
        debit,
        credit,
        balance,
        quantity,
        createdBy,
        createdAt,
        quantity,
        transactionType,
        avatar: {
            public_id: (myCloud ? myCloud.public_id : ""),
            url: (myCloud ? myCloud.secure_url : ""),
        },
    });

    const debitParty = await Party?.findById(debit);

    debitParty.balance = Number(debitParty.balance) + Number(balance);
    debitParty.createdBy = createdBy;
    await debitParty.save();

    const creditParty = await Party?.findById(credit);

    creditParty.balance = Number(creditParty.balance) - Number(balance);
    creditParty.createdBy = createdBy;
    await creditParty.save();

    res.status(201).json({
        success: true,
        message: 'Transaction created successfully, doing more business !',
        transaction,
        debitParty,
        creditParty
    });
});


export const getPartyTransaction = catchAsyncError(async (req, res, next) => {
    const { debit, startDate, endDate } = req.body;
    console.log((req.body));
    const party = await Party.findById(debit);
    const transactions1 = await Transaction.find({ debit: debit }).where({ "createdAt": { "$gte": startDate, "$lte": endDate } }).populate('credit').populate('debit');
    // const transactions = await Transaction.find({ debit: debit } && { credit: debit })
    const transactions2 = await Transaction.find({ credit: debit }).where({ "createdAt": { "$gte": startDate, "$lte": endDate } }).populate('credit').populate('debit');

    const newtra = transactions1.concat(transactions2)
    const transactions = newtra.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.status(200).json({
        success: true,
        transactions,
        party,
    });
});

export const typeWiseTransaction = catchAsyncError(async (req, res, next) => {
    const { type, startDate, endDate } = req.body;
    console.log(type)
    const transactions = await Transaction.find({ transactionType: type }).where({ "createdAt": { "$gte": startDate, "$lte": endDate } }).populate('credit').populate('debit');

    res.status(200).json({
        success: true,
        transactions,
    });
});

export const accountWiseTransaction = catchAsyncError(async (req, res, next) => {
    const { type, startDate, endDate } = req.body;
    const party = await Party.find({ accountType: type }).sort({ name: 1 });
    const transactions = await Transaction.find({ "transactionType": "Sale" }).where({ "createdAt": { "$gte": startDate, "$lte": endDate } });
    res.status(200).json({
        success: true,
        party,
        transactions,
    });
});

export const incomeStatement = catchAsyncError(async (req, res, next) => {
    const { startDate, endDate } = req.body;
    //Sale Part
    const saleTransaction = await Transaction.find({ "transactionType": "Sale" }).where({ "createdAt": { "$gte": startDate, "$lte": endDate } });
    const saleItems = saleTransaction.reduce((res, item) => {
        res.push({ debit: item.debit });
        return res;
    }, []);
    let saleObject = saleItems.map(JSON.stringify);
    let saleSet = new Set(saleObject);
    const saleArray = Array.from(saleSet).map(JSON.parse);
    const lastSale = saleArray.map(s => Object.values(s))
    const resultSale = lastSale.reduce((r, a) => r.concat(a), []);
    const saleParty = await Party.find({ _id: { $in: resultSale } }).sort({ name: 1 });

    //Income Part
    const incomeTransaction = await Transaction.find({ "transactionType": "Receive" }).where({ "createdAt": { "$gte": startDate, "$lte": endDate } });
    const incomeItems = incomeTransaction.reduce((res, item) => {
        res.push({ debit: item.debit });
        return res;
    }, []);
    let incomeObject = incomeItems.map(JSON.stringify);
    let incomeSet = new Set(incomeObject);
    const incomeArray = Array.from(incomeSet).map(JSON.parse);
    const incomeLast = incomeArray.map(s => Object.values(s))
    const incomeResult = incomeLast.reduce((r, a) => r.concat(a), []);
    const incomeParty = await Party.find({ _id: { $in: incomeResult } }).sort({ name: 1 });

    //Expense Part
    const expenseTransaction = await Transaction.find({ "transactionType": "Payment" }).where({ "createdAt": { "$gte": startDate, "$lte": endDate } });
    const expenseItems = expenseTransaction.reduce((res, item) => {
        res.push({ debit: item.debit });
        return res;
    }, []);
    let expenseObject = expenseItems.map(JSON.stringify);
    let expenseSet = new Set(expenseObject);
    const expenseArray = Array.from(expenseSet).map(JSON.parse);
    const expenseLast = expenseArray.map(s => Object.values(s))
    const expenseResult = expenseLast.reduce((r, a) => r.concat(a), []);
    const expenseParty = await Party.find({ _id: { $in: expenseResult } }).sort({ name: 1 });

    //Transaction
    const transactions = await Transaction.find().where({ "createdAt": { "$gte": startDate, "$lte": endDate } });


    res.status(200).json({
        success: true,
        saleParty,
        incomeParty,
        expenseParty,
        transactions
    });
});

Transaction.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

    const income = await Transaction.find({ "transactionType": "Receive" });
    const expense = await Transaction.find({ "transactionType": "Payment" });
    const sale = await Transaction.find({ "transactionType": "Sale" });

    let totalIncome = 0;

    for (let i = 0; i < income?.length; i++) {
        totalIncome += income[i]?.balance
    }



    let totalExpense = 0;

    for (let i = 0; i < expense?.length; i++) {
        totalExpense += expense[i]?.balance
    }


    let totalQuantity = 0;

    for (let i = 0; i < sale?.length; i++) {
        totalQuantity += sale[i]?.quantity
    }
    stats[0].users = totalIncome;
    stats[0].subscription = totalExpense;
    stats[0].views = totalQuantity;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
})


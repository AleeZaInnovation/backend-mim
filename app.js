import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from 'body-parser';


config({
    path: './config/config.env',
})

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}))

import party from './routes/partyRoutes.js';
import transaction from './routes/transactionRoutes.js';
import user from './routes/userRoutes.js';
import payment from './routes/paymentRoutes.js';
import other from './routes/otherRoutes.js';
import { ErrorMiddleware } from "./middlewares/Error.js";

app.use("/api/v1/", party);
app.use("/api/v1/", transaction);
app.use("/api/v1/", user);
app.use("/api/v1/", payment);
app.use("/api/v1/", other);

export default app;

app.get("/", (req, res) => {
    res.send(`<h1>Site is working. click <a href=${process.env.FRONTEND_URL}>here....</a> to visit frontend.</h1>`)
});




app.use(ErrorMiddleware)
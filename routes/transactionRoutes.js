import express from "express";
import { singleUpload } from "../middlewares/multer.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import { accountWiseTransaction, createTransaction, getAllTransaction, getPartyTransaction, typeWiseTransaction } from "../controllers/transactionController.js";

const router = express.Router();
//Get all courses without lectures...
router.route("/transactions").get(getAllTransaction);
//Create new course
router.route("/create-transaction").post(isAuthenticated, authorizedAdmin, singleUpload, createTransaction);
router.route("/party-transaction").post( getPartyTransaction);
router.route("/type-wise-transaction").post( typeWiseTransaction);
router.route("/account-wise-transaction").post( accountWiseTransaction);

export default router;
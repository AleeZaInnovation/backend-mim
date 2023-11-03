import express from "express";
import { singleUpload } from "../middlewares/multer.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import { createParty, getAllParties, getAparty } from "../controllers/partyController.js";

const router = express.Router();
//Get all courses without lectures...
router.route("/parties").get(getAllParties);
router.route("/party-details").post(getAparty);
//Create new course
router.route("/create-party").post(isAuthenticated, authorizedAdmin, singleUpload, createParty);

export default router;
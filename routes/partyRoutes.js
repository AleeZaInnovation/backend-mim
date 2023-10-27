import express from "express";
import { singleUpload } from "../middlewares/multer.js";
import { authorizedAdmin, authorizedSubscribers, isAuthenticated } from "../middlewares/auth.js";
import { createParty, getAllParties, getAparty } from "../controllers/partyController.js";

const router = express.Router();
//Get all courses without lectures...
router.route("/parties").get(getAllParties);
router.route("/party-details").post(getAparty);
//Create new course
router.route("/create-party").post(isAuthenticated, authorizedAdmin, singleUpload, createParty);

// router.route("/course/:id")
//     .get(isAuthenticated, authorizedSubscribers, getCourseLectures)
//     .post(isAuthenticated, authorizedAdmin, singleUpload, addLecture)
//     .delete(isAuthenticated, authorizedAdmin, deleteCourse);


// //Delete Lecture
// router.route("/lecture").delete(isAuthenticated, authorizedAdmin, deleteLecture);

export default router;
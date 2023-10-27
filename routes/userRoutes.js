import express from "express";
import {  changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, login, logout, register, resetPassword, updateProfile, updateProfilePicture, updateUserRole } from "../controllers/userController.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(singleUpload, register);

router.route('/login').post(login);

router.route('/logout').get(logout);

router.route('/me')
    .get(isAuthenticated, getMyProfile)
    .delete(isAuthenticated, deleteMyProfile);

router.route('/change-password').put(isAuthenticated, changePassword);

router.route('/update-profile').put(isAuthenticated, updateProfile);

router.route('/update-profile-picture').put(isAuthenticated, singleUpload, updateProfilePicture);

router.route('/forget-password').post(forgetPassword);

router.route('/resetpassword/:token').put(resetPassword);

//Admin Routes

router.route('/admin/users').get(isAuthenticated, authorizedAdmin, getAllUsers);

router.route('/admin/user/:id')
    .put(isAuthenticated, authorizedAdmin, updateUserRole)
    .delete(isAuthenticated, authorizedAdmin, deleteUser);

export default router;
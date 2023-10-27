import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/dataUri.js";

export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const file = req.file;
    if (!name || !email || !password || !file)
        return next(new ErrorHandler("Please add all fields", 400));
    let user = await User.findOne({ email });
    if (user) return next(new ErrorHandler("User already exist!", 409));



    const fileUri = getDataUri(file)

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    });
    sendToken(res, user, "Registration successfully completed", 201);

});

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(new ErrorHandler("Please add all fields", 400));
    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Email or password are incorrect", 401));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new ErrorHandler("Email or password are incorrect", 401));
    //const file = req.file;
    const admin = await user.role === "admin"
    if (!admin) return next(new ErrorHandler("You have no access to get resource", 401));

    sendToken(res, user, `Welcome back ${user.name}`, 201);

});

export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    }).json({
        success: true,
        message: "Successfully Logout !",
    })
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    res.status(200).json({
        success: true,
        user,
    })
});

export const changePassword = catchAsyncError(async (req, res, next) => {

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
        return next(new ErrorHandler("Please add all fields", 400));
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return next(new ErrorHandler("Old password are incorrect", 401));

    user.password = newPassword;

    await user.save();
    res.status(200).json({
        success: true,
        message: "Password changed successfully !",
    })
});

export const updateProfile = catchAsyncError(async (req, res, next) => {

    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully !",
    })
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {

    const file = req.file;

    const user = await User.findById(req.user._id);

    const fileUri = getDataUri(file)

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile picture updated successfully !",
    })
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    if (!email)
        return next(new ErrorHandler("Please add all fields", 400));

    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler("Email are incorrect", 400));


    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Click to the link to reset your password. ${url} . If you have not request then please ignore.`;

    await sendEmail(user.email, "Reset Password for Course Bundler", message);
    res.status(200).json({
        success: true,
        message: `Reset token send to ${user.email}`,
    })
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;


    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        },
    });

    if (!user) return next(new ErrorHandler("Token is invalid or has been expires !"));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully !",
    });
});

//Admin Controller

export const getAllUsers = catchAsyncError(async (req, res, next,) => {
    const users = await User.find({});

    res.status(200).json({
        success: true,
        users,
    });
});

export const updateUserRole = catchAsyncError(async (req, res, next,) => {
    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("User not fond", 404));

    if (user.role === "user") user.role = "admin";
    else user.role = "user";

    await user.save();

    res.status(200).json({
        success: true,
        message: "Role Updated",
    });
});

export const deleteUser = catchAsyncError(async (req, res, next,) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return next(new ErrorHandler("User not fond", 404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);


    await User.deleteOne();

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});

export const deleteMyProfile = catchAsyncError(async (req, res, next,) => {

    const user = await User.findById(req.user._id);

    if (!user) return next(new ErrorHandler("User not fond", 404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);


    await User.deleteOne();

    res.status(200).cookie("token", null, {
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "User deleted successfully",
    });
});

import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Party } from "../models/Party.js";
import { getDataUri } from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";


export const getAllParties = catchAsyncError(async (req, res, next) => {

    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const parties = await Party.find({
        name: {
            $regex: keyword,
            $options: "i",
        },
        category: {
            $regex: category,
            $options: "i",
        }
    }).sort({ name: 1 });
    res.status(200).json({
        success: true,
        parties,
    });
});

export const getAparty = catchAsyncError(async (req, res, next) => {
    const { id } = req.body
    const party = await Party.findById(id);
    res.status(200).json({
        success: true,
        party,
    });
});


export const createParty = catchAsyncError(async (req, res, next) => {
    const createdBy = req.user.name
    const { name, mobile, address, category, description, accountType, rate } = req.body;
    if (!name || !mobile || !address || !rate || !category || !accountType)
        return next(new ErrorHandler("Please add all fields", 400));
    const file = req.file;
    if (file) {
        const fileUri = getDataUri(file)

        var myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    }
    await Party.create({
        name,
        mobile,
        address,
        category,
        description,
        createdBy,
        accountType,
        rate,
        avatar: {
            public_id: (myCloud ? myCloud.public_id : ""),
            url: (myCloud ? myCloud.secure_url : ""),
        },
    });
    res.status(201).json({
        success: true,
        message: 'Party created successfully, doing more business !'
    });
});

// export const getCourseLectures = catchAsyncError(async (req, res, next) => {
//     const course = await Course.findById(req.params.id);
//     if (!course) return next(new ErrorHandler("Courses are not found", 404))
//     course.views += 1;
//     await course.save();
//     res.status(200).json({
//         success: true,
//         lectures: course.lectures,
//     });
// });

// export const addLecture = catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;
//     const { title, description } = req.body;
//     const course = await Course.findById(id);
//     if (!course) return next(new ErrorHandler("Courses are not found", 404))

//     const file = req.file;

//     const fileUri = getDataUri(file)

//     const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, { resource_type: "video", });

//     course.lectures.push({
//         title,
//         description,
//         video: {
//             public_id: myCloud.public_id,
//             url: myCloud.secure_url,
//         },
//     }),

//         course.numOfVideos = course.lectures.length;
//     await course.save();
//     res.status(200).json({
//         success: true,
//         message: "Lecture added in course !",
//     });
// });

// export const deleteCourse = catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;
//     const course = await Course.findById(id);
//     if (!course) return next(new ErrorHandler("Courses are not found", 404));

//     await cloudinary.v2.uploader.destroy(course.poster.public_id);

//     for (let i = 0; i < course.lectures.length; i++) {
//         const singleLecture = course.lectures[i];
//         await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, { resource_type: "video" });
//     }

//     await Course.deleteOne({ _id: id });

//     res.status(200).json({
//         success: true,
//         message: 'Course deleted successfully!'
//     });
// });

// export const deleteLecture = catchAsyncError(async (req, res, next) => {
//     const { courseId, lectureId } = req.query;
//     const course = await Course.findById(courseId);
//     if (!course) return next(new ErrorHandler("Courses are not found", 404));

//     const lecture = course.lectures.find((item) => {
//         if (item._id.toString() === lectureId.toString()) return item;
//     });
//     await cloudinary.v2.uploader.destroy(lecture.video.public_id, { resource_type: "video" });

//     course.lectures = course.lectures.filter((item) => {
//         if (item._id.toString() !== lectureId.toString()) return item;
//     });

//     course.numOfVideos = course.lectures.length;

//     await course.save();

//     res.status(200).json({
//         success: true,
//         message: 'Lecture deleted successfully!'
//     });
// });
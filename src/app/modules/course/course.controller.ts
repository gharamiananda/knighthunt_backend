import httpStatus from "http-status";
import { CourseServices } from "./course.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const createCourse = catchAsync(async (req, res) => {
  const result = await CourseServices.createCourseIntoDB(req.user,req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Course created successfully",
    data: result,
  });
});

const getAllCourses = catchAsync(async (req, res) => {
  const {meta,courses} = await CourseServices.getAllCoursesFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course are retrieved successfully",
    data: {courses},
    meta
  });
});

const getAllBestReviewCourses = catchAsync(async (req, res) => {
  const course = await CourseServices.getAllBestReviewCoursesFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Best course retrieved successfully",
    data: {course},
  });
});

const getSingleCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const course = await CourseServices.getSingleCourseFromDB(courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course with reviews retrieved successfully",
    data: {course},
  });
});


const updateCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const result = await CourseServices.updateCourseIntoDB(courseId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course is updated successfully",
    data: result,
  });
});

export const CourseControllers = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  getAllBestReviewCourses,
};

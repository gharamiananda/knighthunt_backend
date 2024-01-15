import express from "express";
import { CourseControllers } from "./course.controller";
import validateRequest from "../../middlewares/validateRequest";
import { CourseValidations } from "./course.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/course/best", CourseControllers.getAllBestReviewCourses);
router.get("/courses", CourseControllers.getAllCourses);

router.post(
  "/courses",
  auth('admin'),
  validateRequest(CourseValidations.createCourseValidationSchema),
  CourseControllers.createCourse
);

router.get("/courses/:courseId/reviews", CourseControllers.getSingleCourse);

router.put(
  "/courses/:courseId",
  auth('admin'),

  validateRequest(CourseValidations.updateCourseValidationSchema),
  CourseControllers.updateCourse
);

export const CourseRoutes = router;

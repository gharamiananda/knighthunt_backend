import express from "express";
import { ReviewControllers } from "./review.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidations } from "./review.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", ReviewControllers.getAllReviews);
router.post(
  "/",
  auth('user'),

  validateRequest(ReviewValidations.createReviewValidationSchema),
  ReviewControllers.createReview
);

router.get("/:reviewId", ReviewControllers.getSingleReview);

router.patch(
  "/:reviewId",
  //   validateRequest(AcademicSemesterValidations.),
  ReviewControllers.updateReview
);

export const ReviewRoutes = router;

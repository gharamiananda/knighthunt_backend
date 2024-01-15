import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidations } from "./category.validation";
import { CategoryControllers } from "./category.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", CategoryControllers.getAllCategories);
router.post(
  "/",
  auth('admin'),

  validateRequest(CategoryValidations.createCategoryValidationSchema),
  CategoryControllers.createCategory
);

router.get("/:categoryId", CategoryControllers.getSingleCategory);

router.patch(
  "/:categoryId",
  //   validateRequest(AcademicSemesterValidations.),
  CategoryControllers.updateCategory
);

export const CategoryRoutes = router;

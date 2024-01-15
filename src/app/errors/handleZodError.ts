import { ZodError, ZodIssue } from "zod";
import { BAD_REQUEST } from "http-status";
import { TErrorSource } from "../interface/error";

export const handleZodError = (error: ZodError) => {
  const errorSources: TErrorSource = error.issues.map((err: ZodIssue) => ({
    path: err.path[err.path.length - 1],
    message: err.message,
  }));

  const allFields:Record<string,unknown>={

  }
  
  errorSources
  .forEach((field) => {
    allFields[field.path]=`${allFields[field.path]} is required`}
    )

  const errorMessage =Object.keys(allFields) 
    .map((field) => field + " is required.")
    .join(" ");

  return {
    statusCode: BAD_REQUEST,
    message: "Validation error",
    errorMessage,
    errorSources,
  };
};

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { handleMongooseValidationError } from "../errors/handleMongooseValidationError";
import handleMongooseCastError from "../errors/handleMongooseCastError";
import { handleMongooseDuplicateError } from "../errors/handleMongooseDuplicateError";

import config from "../config";
import AppError from "../errors/AppError";
import { TErrorResponse, TErrorSource } from "../interface/error";
import { handleZodError } from "../errors/handleZodError";
import httpStatus from "http-status";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let errorSources: TErrorSource = [
    {
      path: "",
      message: "",
    },
  ];
  let statusCode = 500;
  let message =error?.message || "Something went wrong!";
  let errorMessage =error?.message || "Something went wrong!";
  let errorFields = ['message', 'data', 'errorMessage', 'errorDetails', 'stack','statusCode'];


   if (error.name === 'jwt expired' ||  error.name ===  "TokenExpiredError" ||   error.name?.includes('Token')) {
    statusCode = 401; // Default to Unauthorized
message = "Unauthorized Access"
  errorFields= errorFields.filter((el) => 'data' !==el);
    
  }
  
  else  if (error.name === "ZodError" && error instanceof ZodError) {
    const simplifiedError: TErrorResponse = handleZodError(error);
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
    statusCode = simplifiedError.statusCode;
    errorMessage = simplifiedError.errorMessage;
  } else if (error.name === "ValidationError") {
    const simplifiedError = handleMongooseValidationError(error);
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
    statusCode = simplifiedError.statusCode;
  } else if (error.name === "CastError") {
    const simplifiedError = handleMongooseCastError(error);
    message = "Invalid Id";
    errorSources = simplifiedError.errorSources;
    statusCode = simplifiedError.statusCode;
    errorMessage = simplifiedError.errorMessage;
  } else if (error.code === 11000) {
    const simplifiedError = handleMongooseDuplicateError(error);
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
    statusCode = simplifiedError.statusCode;
  } else if (error instanceof AppError) {
    errorSources = [{ path: "", message: error.message }];
    statusCode = error.statusCode;
    if(error?.excludeFields){

        errorFields= errorFields.filter((el) => !error?.excludeFields?.split(' ')?.includes(el));
      delete error?.excludeFields
     }
  } 
  

  else if (error instanceof Error) {
    errorSources = [{ path: "", message: error.message }];
  errorFields= errorFields.filter((el) => 'data' !==el);

  }
  const myObject :Record<string,unknown>= {
    statusCode,
    message,
    errorMessage:statusCode=== httpStatus.UNAUTHORIZED ? "You do not have the necessary permissions to access this resource." :errorMessage,
    errorDetails: statusCode=== httpStatus.UNAUTHORIZED ? null : error,
    stack: statusCode=== httpStatus.UNAUTHORIZED ? null: error.stack,
    data:null
  }
  
  console.log('error?.name', error?.name)
  
  const errorResponseObject:Record<string,unknown> = {};
  errorFields.forEach(key => {
    if ( Object.keys(myObject).includes(key)) {
      errorResponseObject[key] = myObject[key];
    }
  });
  return res.status(statusCode).json({
    success: false,
    ...errorResponseObject
  });
};

export default globalErrorHandler;
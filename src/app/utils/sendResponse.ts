import { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const resSendData: TResponse<T> = {
    success: data.success,
    statusCode: data?.statusCode,
    message: data.message,

    data: data.data,
  };
  if (data.meta) {
    resSendData.meta = data.meta;
     resSendData.data= data.data

  }
  res.status(data?.statusCode).json(resSendData);
};

export default sendResponse;

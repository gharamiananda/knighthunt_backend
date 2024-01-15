class AppError extends Error {
  public statusCode: number;
  public excludeFields: string|undefined;


  constructor(statusCode: number, message: string,excludeFields?: string|undefined, stack = "") {
    super(message);

    this.statusCode = statusCode;
    this.excludeFields = excludeFields;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export default AppError;

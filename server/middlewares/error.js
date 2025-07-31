import ErrorHandler from "../utils/errorHandler.js";

export const errorListening = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Wrong MongoDB ID (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found: Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${Object.keys(
      err.keyValue
    ).join(", ")}`;
    err = new ErrorHandler(message, 400);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid token, please try again`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = `Your token has expired, please log in again`;
    err = new ErrorHandler(message, 400);
  }

  // Multer File Upload Error
  if (err.name === "MulterError") {
    const message = `File upload error: ${err.message}`;
    err = new ErrorHandler(message, 400);
  }

  // ENOTFOUND (Database or Host Connection Error)
  if (err.name === "ENOTFOUND") {
    const message = `Unable to connect to server: ${err.message}`;
    err = new ErrorHandler(message, 503);
  }

  // Validation Errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // MongoDB Write Concern Error
  if (err.name === "WriteConcernError") {
    const message = `Database write operation failed: ${err.message}`;
    err = new ErrorHandler(message, 500);
  }

  // Mongoose Connection Error
  if (err.name === "MongooseServerSelectionError") {
    const message = `Database connection error: ${
      err.reason.message || "Unable to connect to the database"
    }`;
    err = new ErrorHandler(message, 503);
  }

  // General Network Error
  if (err.name === "NetworkError") {
    const message = `A network error occurred: ${err.message}`;
    err = new ErrorHandler(message, 503);
  }

  // Unhandled Syntax Errors
  if (err.name === "SyntaxError") {
    const message = `Unexpected syntax in request: ${err.message}`;
    err = new ErrorHandler(message, 400);
  }

  // Default Error Response
  res.status(err.statusCode).json({
    success: false,
    error: err.name,
    message: err.message,
  });
};

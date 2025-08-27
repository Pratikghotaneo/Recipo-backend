const errormiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };

    error.message = err.message;

    console.error(error);

    if (err.name === "CastError") {
      const message = "Resource not found";

      error = new Error(message);
      error.statusCode = 404;
    }
    if (err.code === 11000) {
      const message = "Duplicate field value enter";

      error = new Error(message);
      error.statusCode = 400;
    }
    if (err.name === "validtionError") {
      const message = Object.values(err.errors).map((val) => val.message);

      error = new Error(message.join(", "));
      error.statusCode = 400;
    }

    res
      .status(error.statusCode || 500)
      .json({ success: false, error: error.message || "Server Error" });
  } catch (error) {
    next(error);
  }
};

export default errormiddleware;

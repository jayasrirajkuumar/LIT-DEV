export function requestTimeout(ms) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (res.headersSent) return;
      res.status(504).json({
        success: false,
        message: "The server took too long to respond. Please try again.",
        error: {
          code: "REQUEST_TIMEOUT",
          message: "The server took too long to respond. Please try again.",
        },
      });
    }, ms);

    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));
    next();
  };
}

export default requestTimeout;

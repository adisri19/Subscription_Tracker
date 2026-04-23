import aj from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ success: false, message: "Too Many Requests" });
      }

      if (decision.reason.isBot()) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return next();
  } catch (error) {
    console.error("Arcjet evaluation error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export default arcjetMiddleware;

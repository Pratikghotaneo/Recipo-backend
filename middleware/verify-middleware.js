import passport from "passport";

export const verifyToken = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    console.log("Authentication info:", user, info);
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // user is logged in, proceed
  }
  res.status(401).json({ message: "Unauthorized. Please log in first." });
}

export function isNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next(); // user is not logged in, proceed
  }
  res.redirect("/docs");
}

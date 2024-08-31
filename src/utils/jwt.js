import jwt from "jsonwebtoken";

// Middleware for JWT authentication
const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: "Token Not Found" });

  const token = authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Authentication Failed:", err);
    res.status(401).json({ error: "Invalid Token" });
  }
};

// Function to generate a JWT token
const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "15m" });
};

export { jwtAuthMiddleware, generateToken };

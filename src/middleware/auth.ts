import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../config/db";

const auth = (...allowedRoles: ("admin" | "user")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing token" });
      }

      const token = authHeader.split(" ")[1] as string;

      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

      const userResult = await pool.query(
        `SELECT * FROM users WHERE email=$1`,
        [decoded.email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      req.user = decoded;

      // Role authorization
      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  };
};

export default auth;

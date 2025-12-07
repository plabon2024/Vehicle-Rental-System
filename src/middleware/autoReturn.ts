import { NextFunction, Request, Response } from "express";
import { bookingService } from "../modules/bookings/bookings.service";

let lastRunTime = 0;
const THROTTLE_MS = 5 * 60 * 1000; // Run at most once every 5 minutes

export const autoReturnMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = Date.now();
    
    // Only run if enough time has passed
    if (now - lastRunTime > THROTTLE_MS) {
      lastRunTime = now;
      
      // Run in background, don't block the request
      bookingService.autoReturnExpiredBookings().catch(err => {
        console.error('Background auto-return failed:', err);
      });
    }
    
    next();
  } catch (err) {
    // Don't let auto-return errors break the request
    console.error('Auto-return middleware error:', err);
    next();
  }
};
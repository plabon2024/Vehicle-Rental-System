import { Request, Response } from "express";
import { Roles } from "../auth/auth.constant";
import { bookingService } from "./bookings.service";
const createBooking = async (req: Request, res: Response) => {
  try {
    
    const authUser = (req as any).user;
   
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
      req.body;

    const isAdmin = authUser?.role === Roles.admin;
    const isCustomer = authUser?.role === Roles.customer;

    if (!isAdmin && !isCustomer) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create bookings",
      });
    }

    // Customer can only create booking for themselves
    if (isCustomer && customer_id !== authUser.id) {
      return res.status(403).json({
        success: false,
        message: "You can only create bookings for your own account",
      });
    }

    const result = await bookingService.createBookingFromDB({
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: result.id,
        customer_id: result.customer_id,
        vehicle_id: result.vehicle_id,
        rent_start_date: result.rent_start_date,
        rent_end_date: result.rent_end_date,
        total_price: Number(result.total_price),
        status: result.status,
        vehicle: {
          vehicle_name: result.vehicle_name,
          daily_rent_price: result.daily_rent_price,
        },
      },
    });
  } catch (error: any) {
    // Map some known errors to 4xx
    if (
      error.message === "Vehicle not found" ||
      error.message === "Vehicle is not available for booking" ||
      error.message === "rent_end_date must be after rent_start_date" ||
      error.message === "Invalid date format"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllBookings = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const isAdmin = authUser?.role === Roles.admin;
    const isCustomer = authUser?.role === Roles.customer;

    if (!isAdmin && !isCustomer) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view bookings",
      });
    }

    if (isAdmin) {
      const result = await bookingService.getAllBookingsForAdminFromDB();

      const data = result.rows.map((row: any) => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: Number(row.total_price),
        status: row.status,
        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
        },
      }));

      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data,
      });
    }

    // Customer view
    const result = await bookingService.getBookingsForCustomerFromDB(
      authUser.id
    );

    const data = result.rows.map((row: any) => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: Number(row.total_price),
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    }));

    return res.status(200).json({
      success: true,
      message: "Your bookings retrieved successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const bookingId = Number(req.params.bookingId);
    const { status } = req.body as { status?: string };

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (status !== "cancelled" && status !== "returned") {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: cancelled, returned",
      });
    }

    const isAdmin = authUser?.role === Roles.admin;
    const isCustomer = authUser?.role === Roles.customer;

    if (!isAdmin && !isCustomer) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update bookings",
      });
    }

    // Fetch current booking
    const bookingResult = await bookingService.getBookingByIdFromDB(bookingId);

    if (bookingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    // Customer rules
    if (isCustomer) {
      if (booking.customer_id !== authUser.id) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to update this booking",
        });
      }

      if (status !== "cancelled") {
        return res.status(403).json({
          success: false,
          message: "Customers can only cancel bookings",
        });
      }

      if (booking.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Only active bookings can be cancelled",
        });
      }
    }

    // Admin rules
    if (isAdmin) {
      if (status === "returned" && booking.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Only active bookings can be marked as returned",
        });
      }
      // Admin can set cancelled or returned; you can tighten this if needed.
    }

    // Perform status update and vehicle availability update
    const result = await bookingService.updateBookingStatusFromDB(
      bookingId,
      status as "cancelled" | "returned"
    );

    if (status === "cancelled") {
      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: {
          id: result.booking.id,
          customer_id: result.booking.customer_id,
          vehicle_id: result.booking.vehicle_id,
          rent_start_date: result.booking.rent_start_date,
          rent_end_date: result.booking.rent_end_date,
          total_price: Number(result.booking.total_price),
          status: result.booking.status,
        },
      });
    }

    // status === "returned"
    return res.status(200).json({
      success: true,
      message: "Booking marked as returned. Vehicle is now available",
      data: {
        id: result.booking.id,
        customer_id: result.booking.customer_id,
        vehicle_id: result.booking.vehicle_id,
        rent_start_date: result.booking.rent_start_date,
        rent_end_date: result.booking.rent_end_date,
        total_price: Number(result.booking.total_price),
        status: result.booking.status,
        vehicle: {
          availability_status: result.vehicle?.availability_status,
        },
      },
    });
  } catch (error: any) {
    if (error.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const bookingController = {
  createBooking,
  getAllBookings,
  updateBooking,
};

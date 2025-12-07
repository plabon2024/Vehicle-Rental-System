import { pool } from "../../config/db";
interface CreateBookingPayload {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string; // ISO date string
  rent_end_date: string; // ISO date string
}

const createBookingFromDB = async (payload: CreateBookingPayload) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  try {
    // Lock vehicle row for update to avoid race conditions
    const vehicleResult = await pool.query(
      `
      SELECT id, vehicle_name, daily_rent_price, availability_status
      FROM vehicles
      WHERE id = $1
      FOR UPDATE
      `,
      [vehicle_id]
    );

    if (vehicleResult.rowCount === 0) {
      throw new Error("Vehicle not found");
    }

    const vehicle = vehicleResult.rows[0];

    if (vehicle.availability_status !== "available") {
      throw new Error("Vehicle is not available for booking");
    }

    // Calculate  days 
    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);
    const diffMs = end.getTime() - start.getTime();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date format");
    }

    if (diffMs <= 0) {
      throw new Error("rent_end_date must be after rent_start_date");
    }

    const days = diffMs / (1000 * 60 * 60 * 24);
    const totalPrice = days * Number(vehicle.daily_rent_price);

    // Create booking
    const bookingResult = await pool.query(
      `
      INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
      `,
      [
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date,
        totalPrice,
        "active",
      ]
    );

    const booking = bookingResult.rows[0];

    // Update vehicle status
    await pool.query(
      `
      UPDATE vehicles
      SET availability_status = $1
      WHERE id = $2
      `,
      ["unavailable", vehicle_id]
    );

    // Combine booking and vehicle data
    const bookingWithVehicle = {
      ...booking,
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: vehicle.daily_rent_price,
    };

    return bookingWithVehicle;
  } catch (error) {
    throw error;
  }
};

const getAllBookingsForAdminFromDB = async () => {
  const result = await pool.query(
    `
    SELECT
      b.id,
      b.customer_id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      u.name AS customer_name,
      u.email AS customer_email,
      v.vehicle_name,
      v.registration_number
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN vehicles v ON b.vehicle_id = v.id
    ORDER BY b.id DESC
    `
  );

  return result;
};

const getBookingsForCustomerFromDB = async (customerId: number) => {
  const result = await pool.query(
    `
    SELECT
      b.id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      v.vehicle_name,
      v.registration_number,
      v.type
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.customer_id = $1
    ORDER BY b.id DESC
    `,
    [customerId]
  );

  return result;
};

const getBookingByIdFromDB = async (bookingId: number) => {
  const result = await pool.query(
    `
    SELECT
      id,
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      status
    FROM bookings
    WHERE id = $1
    `,
    [bookingId]
  );

  return result;
};

const updateBookingStatusFromDB = async (
  bookingId: number,
  newStatus: "cancelled" | "returned"
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock booking row
    const bookingResult = await client.query(
      `
      SELECT
        id,
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date,
        total_price,
        status
      FROM bookings
      WHERE id = $1
      FOR UPDATE
      `,
      [bookingId]
    );

    if (bookingResult.rowCount === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookingResult.rows[0];

    // Update booking status
    const updatedBookingResult = await client.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE id = $2
      RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
      `,
      [newStatus, bookingId]
    );

    const updatedBooking = updatedBookingResult.rows[0];

    // For both cancelled and returned, we can safely set vehicle to available
    const vehicleResult = await client.query(
      `
      UPDATE vehicles
      SET availability_status = $1
      WHERE id = $2
      RETURNING id, availability_status
      `,
      ["available", booking.vehicle_id]
    );

    const vehicle = vehicleResult.rows[0] || null;

    await client.query("COMMIT");

    return {
      booking: updatedBooking,
      vehicle,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const bookingService = {
  createBookingFromDB,
  getAllBookingsForAdminFromDB,
  getBookingsForCustomerFromDB,
  getBookingByIdFromDB,
  updateBookingStatusFromDB,
};

import { pool } from "../../config/db";

const createVehicle = async (payload: Record<string, unknown>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const result = await pool.query(
    `
      INSERT INTO vehicles ( vehicle_name, type, registration_number, daily_rent_price,availability_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, vehicle_name, type, registration_number, daily_rent_price,availability_status;
      `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result;
};
const getAllVehicles = async () => {
  return pool.query(
    `SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles`
  );
};

const getVehicleById = async (id: number) => {
  return pool.query(
    `SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1`,
    [id]
  );
};

const updateVehicleInDB = async (
  id: number,
  payload: Record<string, unknown>
) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in payload) {
    fields.push(`${key}=$${index}`);
    values.push((payload as any)[key]);
    index++;
  }

  if (fields.length === 0) {
    return { rowCount: 0, rows: [] };
  }

  const query = `
    UPDATE vehicles
    SET ${fields.join(", ")}
    WHERE id=$${index}
    RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
  `;
  values.push(id);

  const result = await pool.query(query, values);
  return result;
};

const deleteVehicleFromDB = async (id: number) => {
  const result = await pool.query(
    `
    DELETE FROM vehicles
    WHERE id = $1
    RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
    `,
    [id]
  );

  return result;
};
export const vehiclesServices = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleInDB,
  deleteVehicleFromDB,
};

import dotenv from "dotenv";
import { Pool } from "pg";
import config from ".";

dotenv.config();
export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(250) NOT NULL,
      email VARCHAR(250) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone VARCHAR(20) NOT NULL,
      role VARCHAR(50)  DEFAULT 'customer'
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      vehicle_name VARCHAR(250) NOT NULL,
      type VARCHAR(20) NOT NULL,
      registration_number VARCHAR(100) UNIQUE NOT NULL,
      daily_rent_price NUMERIC(10,2) NOT NULL CHECK (daily_rent_price > 0),
      availability_status VARCHAR(20) DEFAULT 'available'
        
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      rent_start_date DATE NOT NULL,
      rent_end_date DATE NOT NULL,
      total_price NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
      status VARCHAR(20) DEFAULT 'active'
        
    );
  `);

  console.log("connected to db");
};


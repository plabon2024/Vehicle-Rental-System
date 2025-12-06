import dotenv from "dotenv";
import { Pool } from 'pg';
import config from ".";


dotenv.config();
export const pool = new Pool({
  connectionString: config.databaseUrl
})

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
  console.log('connected to db')
};

initDB()
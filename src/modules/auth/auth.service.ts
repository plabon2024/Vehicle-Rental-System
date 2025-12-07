import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";
const createUserIntoDB = async (payload: Record<string, unknown>) => {
  const { id, name, email, password, phone, role } = payload;

  const hashedPassword = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `
      INSERT INTO users (name, email, password, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, role;
      `,
    [name, email, hashedPassword, phone, role]
  );
  delete result.rows[0].password;
  return result;
};

const loginUserIntoDB = async (email: string, password: string) => {
  const user = await pool.query(
    `
    SELECT * FROM users WHERE EMAIL=$1
    `,
    [email]
  );
  const matchPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.rows[0].id,
    name: user.rows[0].name,
    email: user.rows[0].email,
    phone: user.rows[0].phone,
    role: user.rows[0].role,
  };

  const token = jwt.sign(jwtPayload, config.jwtSecret, { expiresIn: "1D" });
  delete user.rows[0].password;
  return { token, user: user.rows[0] };
};
export const authServices = {
  loginUserIntoDB,
  createUserIntoDB,
};

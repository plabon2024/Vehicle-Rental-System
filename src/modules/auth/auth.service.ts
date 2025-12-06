import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";

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



  const token = jwt.sign(jwtPayload,config.jwtSecret, { expiresIn: "1D" });
  delete user.rows[0].password
  return { token, user: user.rows[0] };
};
export const authServices = {
  loginUserIntoDB,
};

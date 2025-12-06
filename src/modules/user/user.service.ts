import bcrypt from 'bcrypt';
import { pool } from '../../config/db';


const createUserIntoDB = async (payload: Record<string, unknown>) => {
    const { name, email, password, phone, role } = payload;

    const hashedPassword = await bcrypt.hash(password as string, 10);

    const result = await pool.query(
        `
      INSERT INTO users (name, email, password, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, role;
      `,
        [name, email, hashedPassword, phone, role ]
    );
    delete result.rows[0].password
    return result

}


export const userService = {
    createUserIntoDB
} 
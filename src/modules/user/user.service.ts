import { pool } from "../../config/db";

const getAllUserFromDB = async () => {
  const result = await pool.query(`
    SELECT id,name,email,phone,role FROM users
    `);

  return result;
};
const updateUserFromDB = async (id: number, payload: Record<string, unknown>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in payload) {
    fields.push(`${key}=$${index}`);
    values.push((payload as any)[key]);
    index++;
  }

  if (fields.length === 0) {
    // nothing to update
    return { rowCount: 0, rows: [] };
  }

  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id=$${index}
    RETURNING id, name, email, phone, role
  `;
  values.push(id);

  const result = await pool.query(query, values);
  return result;
};

const deleteUserFromDB = async (id: number) => {
  const result = await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, name, email, phone, role
    `,
    [id]
  );

  return result;
};

export const userService = {
  getAllUserFromDB,
  updateUserFromDB,
  deleteUserFromDB,
};

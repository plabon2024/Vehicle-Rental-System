import dotenv from "dotenv";
import path from 'path'
dotenv.config({ path: path.join(process.cwd(), ".env") });
const config = {
    databaseUrl: process.env.DATABASE_URL as string,
    jwtSecret:process.env.JWT_SECRET as string
}
export default config
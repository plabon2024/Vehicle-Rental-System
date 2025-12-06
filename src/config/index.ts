import dotenv from "dotenv";
import path from 'path'
dotenv.config({ path: path.join(process.cwd(), ".env") });
const config = {
    databaseUrl: process.env.DATABASE_URL as string,
    jwtSecret:process.env.JWT_SECRET as string,
    port: process.env.PORT ? Number(process.env.PORT) : 5000
}
export default config
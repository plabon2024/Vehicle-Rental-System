import express, { Request, Response } from 'express';
import { initDB } from './config/db';
import { userRoute } from './modules/user/user.route';
import { authRoute } from './modules/auth/auth.route';
import config from './config';

const app = express();
app.use(express.json());

initDB()

// user 
app.use("/", userRoute)
app.use("/", userRoute)

// auth 
app.use("/api/v1/auth/signin", authRoute)

const port = config.port || 5000;
app.listen(port, () => {
    console.log(`server running on ${port}`)
})
app.get('/', (req: Request, res: Response) => {
    res.status(200).json(
        {
            message: "this is the root route",
            path: req.path
        }
    )

})
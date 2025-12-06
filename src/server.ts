import express, { Request, Response } from 'express';
import { initDB } from './config/db';
import { userRoute } from './modules/user/user.route';
import { authRoute } from './modules/auth/auth.route';

const app = express();
app.use(express.json());

initDB()

// user 
app.use("/api/v1/auth/signup", userRoute)
// auth 
app.use("/api/v1/auth/signin", authRoute)


app.listen(5000, () => {
    console.log('server running on 5000')
})
app.get('/', (req: Request, res: Response) => {
    res.status(200).json(
        {
            message: "this is the root route",
            path: req.path
        }
    )

})
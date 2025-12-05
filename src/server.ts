import express, { Request, Response } from 'express'
const app = express()
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
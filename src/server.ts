import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
// import threadsRoutes from './threads/threads.routes';
// import { verifyAPIKey } from './middlewares/auth';
import { log } from './commons/log';

dotenv.config();

const app = express();

app.get("/", (req: Request, res: Response) => {
  return res.status(200).send("Billiard Booking System Running")
})

app.use(express.json());
// app.use(verifyAPIKey());
// app.use("/threads", threadsRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  log(`🚀 Billiard Booking System has started on port ${PORT}`);
})
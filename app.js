import express, { json, urlencoded, static as static_ } from 'express';
import path, { join } from 'path'
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors'
import dotenv from 'dotenv';
import indexRouter from './routes/index.js';


dotenv.config();

const app = express();

const __dirname = path.resolve();

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.FRONT_END_ORIGIN
}))
app.use(static_(join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use((req, res, next) => {
    res.status(404);
    if (req.accepts('json')) {
        res.json({ error: 'Not found' });
        return;
    }
})

export default app;

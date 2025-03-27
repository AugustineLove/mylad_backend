import express, { response } from 'express';
import router from './routes/index.mjs';
import { mongoose } from 'mongoose';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

const PORT = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URI

mongoose.connect(mongoUrl)
.then( () => {
    app.listen(PORT, () => {
        console.log(`Running on Port ${PORT}`)
    })
    console.log('Connected to database');
})
.catch((err)=> console.log(err))
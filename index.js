import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './src/routes/auth.router.js';
import meRouter from './src/routes/me.router.js';
import usersRouter from './src/routes/users.router.js';

const apiVersion ="v1"

dotenv.config();

const app = express();
const PORT = process.env.port || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req,res) =>{
    res.json({ message: 'Welcome to Blog Backend System' });
});


app.use(`/api/${apiVersion}/auth`, authRouter);
app.use(`/api/${apiVersion}/me`, meRouter);
app.use(`/api/${apiVersion}/users`, usersRouter);

app.use((req,res) =>{
    res.status(404).json({ message: 'Route not found' });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
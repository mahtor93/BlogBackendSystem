import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.port || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req,res) =>{
    res.json({ message: 'Welcome to Blog Backend System' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
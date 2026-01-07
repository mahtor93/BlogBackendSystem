import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './src/routes/routes.js';

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

app.use(`/api/${apiVersion}`, router);


app.use((req,res) =>{
    res.status(404).json({ message: 'Route not found' });
})

app.listen(PORT, () => {
    console.log('-------------------------------------');
    console.log(`Server is running on port ${PORT}.`);
    console.log('-------------------------------------');

});
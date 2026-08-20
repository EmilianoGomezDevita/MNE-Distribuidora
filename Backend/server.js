import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoute.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({mensaje: "API de MNE backend funcionando"})
})

app.use('/api/auth', authRoutes)

app.listen(port, () => {
    console.log("Servidor corriendo en ", port)
})


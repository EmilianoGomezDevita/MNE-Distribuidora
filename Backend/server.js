import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './src/routes/authRoute.js';
import adminRoutes from './src/routes/adminRoute.js'
import productosRoutes from './src/routes/prodRoute.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({mensaje: "API de MNE backend funcionando"})
})

app.use('/api/auth', authRoutes)

app.use('/api/cat', productosRoutes)

app.use('/api/admin', adminRoutes)

app.use((req, res) => {
    res.status(404).sendFile(path.join(process.cwd(), '..', '/Frontend/pages/404.html'))
})

app.listen(port, () => {
    console.log("Servidor corriendo en ", port);
});

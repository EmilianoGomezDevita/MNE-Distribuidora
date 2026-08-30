//Llamamos a la libreria dotenv y sus condiguraciones con .config()
import dotenv from 'dotenv';

function manejarError(res, status, mensaje, error){
    console.error(error);

    const respuesta = { mensaje }

    if(process.env.NODE_ENV !== 'production'){
        respuesta.error = error.message;
    }

    return res.status(status).json(respuesta)
}

export {manejarError};
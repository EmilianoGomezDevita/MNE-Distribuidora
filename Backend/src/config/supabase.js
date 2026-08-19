//Llamamos a la libreria dotenv y sus condiguraciones con .config()
import dotenv from 'dotenv';
dotenv.config();
//llamamos a la funcion crear cliente de supabase 
import { createClient } from '@supabase/supabase-js'
//hacemos una const que contenga la funcion con los parametros nuestro
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        // Asegura que no viaje ningún JWT de usuario previo
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  }
)
//exportamos la funcion
export { supabase }
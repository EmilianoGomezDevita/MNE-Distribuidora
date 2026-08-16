import { supabase } from "../config/supabase.js";

async function registrar(req, res) {
    const {email, password, nombre, apellido} = req.body;

    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {nombre, apellido}
        }
    })
    if(error){
        res.status(400).json({ mensaje: "Error al registrar", error: error.message });
    }
    else{
        res.status(201).json({mensaje: "Resgistro con exito"});
    }
   
}

export {registrar};

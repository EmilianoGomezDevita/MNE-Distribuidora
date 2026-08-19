import { supabase } from "../config/supabase.js";

async function registrar(req, res) {
    const {email, password, nombre, apellido} = req.body;

    const {data, error: errorReg} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {nombre, apellido}
        }
    })
    if(errorReg){
        return res.status(400).json({ mensaje: "Error al registrar", error: errorReg.message });
    }
    const id_U = data.user.id;
    //<=====Subida de la direccion del usuario=============>\\
    const {nombreDireccion, calle, numeroCalle, cp, piso, localidad, provincia} = req.body;

    const {error: errorDirecciones} = await supabase
    .from('Direcciones')
    .insert({id_U,
        nombreDireccion: nombreDireccion,
        calle: calle,
        nroCalle: numeroCalle,
        CP: cp,
        piso: piso,
        ciudad: localidad,
        provincia:provincia })

    if(errorDirecciones){
        return res.status(400).json({mensaje: "Error al subir la direccion", error: errorDirecciones.message})
    }
    //<=====Subida de la info. profesional del usuario=============>\\
    if(req.body.esProfesional === "true"){
        const {profesion, matricula,} = req.body
        const {data: dataProfesion, error: errorProfesion } = await supabase
        .from('Profesiones')
        .select("id").eq('profesion', profesion).single()

        if(errorProfesion){
            return res.status(400).json({mensaje: "Error en la consulta", error: errorProfesion.message})
        }
        

        const {data: dataStorage, error: errorStorage} = await supabase.storage
        .from('credenciales')
        .upload(`${id_U}-${req.file.originalname}`, req.file.buffer, {contentType: req.file.mimetype})

        if(errorStorage){
            return res.status(400).json({mensaje: "Error al recibir Informacion del profesional", error: errorStorage.message})
        }
        

        const {error: errorEsProf} = await supabase
        .from('SolicitudProfesional')
        .insert({
            user_USP: id_U,
            id_Prof: dataProfesion.id,
            matricula: matricula,
            documentacion: dataStorage.path,
            fechaSolicitud: new Date()
        })

        if(errorEsProf){
            return res.status(400).json({mensaje: "Error al subir Informacion del profesional", error: errorEsProf.message})
        }
    }
    res.status(201).json({mensaje: "Resgistro con exito"});

   
}

export {registrar};

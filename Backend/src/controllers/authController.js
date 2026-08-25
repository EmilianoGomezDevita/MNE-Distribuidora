import { supabase } from "../config/supabase.js";

async function registrar(req, res) {
    const { email, password, nombre, apellido, telefono } = req.body;

    const { data, error: errorReg } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { nombre, apellido, telefono }
        }
    })
    if (errorReg) {
        return res.status(400).json({ mensaje: "Error al registrar", error: errorReg.message });
    }
    const id_U = data.user.id;
    try {

        //<=====Subida de la direccion del usuario=============>\\
        const { nombreDireccion, calle, numeroCalle, cp, piso, localidad, provincia } = req.body;

        const { error: errorDirecciones } = await supabase
            .from('Direcciones')
            .insert({
                id_U,
                nombreDireccion: nombreDireccion,
                calle: calle,
                nroCalle: numeroCalle,
                CP: cp,
                piso: piso,
                ciudad: localidad,
                provincia: provincia
            })

        if (errorDirecciones) {
            console.log('Error completo:', errorDirecciones);
            throw new Error(errorDirecciones.message);
        }
        //<=====Subida de la info. profesional del usuario=============>\\
        if (req.body.esProfesional === "true") {
            const { profesion, "DNI-CUIL": dniCuil } = req.body
            const { data: dataProfesion, error: errorProfesion } = await supabase
                .from('Profesiones')
                .select("id").eq('profesion', profesion).single()

            if (errorProfesion) {
                throw new Error(errorProfesion.message);
            }


            const { data: dataStorage, error: errorStorage } = await supabase.storage
                .from('credenciales')
                .upload(`${id_U}-${req.file.originalname}`, req.file.buffer, { contentType: req.file.mimetype })

            if (errorStorage) {
                throw new Error(errorStorage.message);
            }


            const { error: errorEsProf } = await supabase
                .from('SolicitudProfesional')
                .insert({
                    user_USP: id_U,
                    id_Prof: dataProfesion.id,
                   "DNI-CUIL": dniCuil,
                    documentacion: dataStorage.path,
                    fechaSolicitud: new Date()
                })

            if (errorEsProf) {
                throw new Error(errorEsProf.message);
            }
        }
        res.status(201).json({ mensaje: "Resgistro con exito" });
    }
    catch (err) {
        await supabase.auth.admin.deleteUser(id_U)
        res.status(400).json({ mensaje: "Error al completar el registro", error: err.message })
    }

}

async function iniciar(req, res) {

    const {email, password} = req.body;

    const {data: dataLogIn, error: errorLogIn} = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    if(errorLogIn){
        return res.status(401).json({mensaje: "Error al iniciar sesion. correo o contraseña", error: errorLogIn.message})
    }
    return res.status(200).json({
        mensaje: "inicio de sesion exitoso",
        token: dataLogIn.session.access_token,
        usuario: {
            id: dataLogIn.user.id,
            email: dataLogIn.user.email
        }
    })
}

export { registrar, iniciar };

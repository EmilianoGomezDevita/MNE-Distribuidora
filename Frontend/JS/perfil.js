document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('token')
    if(token === null){
         window.location.href = "./crearCuenta.html";
         return;
    }
    fetch("/api/auth/perfil", {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })
    .then(res => {
        if(!res.ok){
            localStorage.removeItem('token')
            window.location.href = "./crearCuenta.html";
            throw new Error("Token vencido o inválido");
        }
        return res.json()

    }) 
    .then(data => {
        document.getElementById('nombre').textContent =   data.nombre
        document.getElementById('apellido').textContent = data.apellido
        document.getElementById('email').textContent = data.email
        document.getElementById('tipoCuenta').textContent = data.tipoCuenta
    })
    .catch(error => {
        console.error("Error al consultar el perfil", error);
    })
})
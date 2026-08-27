document.addEventListener('DOMContentLoaded', function(){
    const btnBurguer = document.getElementById('btn-hamburguesa');
    const mainNav = document.getElementById('main-nav')

    if(btnBurguer && mainNav){
        btnBurguer.addEventListener("click", function(){
            mainNav.classList.toggle("active")
        })
    }
})

const sezioni = document.querySelectorAll('.menu-items .menu-link')
Array.from(sezioni).forEach(sezione=>{
    sezione.addEventListener('click', ev=>{
        document.querySelector('#menu-toggle').checked = false;
    })
})

document.addEventListener('click', (ev) => {
    const menuContainer = document.getElementById('menu-container');
    const menuToggle = document.getElementById('menu-toggle');
    if (!menuContainer.contains(ev.target)) {
        menuToggle.checked = false;
    }
});
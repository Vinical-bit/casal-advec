
 
function mostrarFormulario(tipo,botao){
    document.getElementById('form-casais').classList.add('oculto');
    document.getElementById('form-noivos').classList.add('oculto');

    document.querySelectorAll('.btn-curso').forEach(btn=> btn.classList.remove('ativo'));

    document.getElementById('form-' + tipo).classList.remove('oculto');
    botao.classList.add('ativo');
}


const areas = document.querySelectorAll('.area');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visivel');
            }, i * 120);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

areas.forEach(area => observer.observe(area));
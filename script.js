

const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    drawer.classList.toggle('open');
});


function mostrarFormulario(tipo,botao){
    document.getElementById('form-casais').classList.add('oculto');
    document.getElementById('form-noivos').classList.add('oculto');

    document.querySelectorAll('.btn-curso').forEach(btn=> btn.classList.remove('ativo'));

    document.getElementById('form-' + tipo).classList.remove('oculto');
    botao.classList.add('ativo');
}

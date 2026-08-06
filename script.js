

function mostrarFormulario(tipo, botao) {
    document.getElementById('form-casais').classList.add('oculto');
    document.getElementById('form-noivos').classList.add('oculto');

    document.querySelectorAll('.btn-curso').forEach(btn => btn.classList.remove('ativo'));

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

const track = document.getElementById('depoimentos-track');
const dots = document.querySelectorAll('#depoimentos-dots .dot');

track.addEventListener('scroll', () => {
    const paginaAtual = Math.round(track.scrollLeft / track.clientWidth);

    dots.forEach((dot, i) => {
        dot.classList.toggle('ativo', i === paginaAtual);
    });
});

function irParaNoivos() {
    const botaoNoivos = document.querySelector('.btn-curso[onclick*="noivos"]');
    mostrarFormulario('noivos', botaoNoivos);
}

// ===== INTEGRAÇÃO COM GOOGLE SHEETS =====
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbzSKSjIQI1_pbZTnI73amRmLdlEy59Ui-03NcmVisplHgX70FX17_FSq9Nqg7ErQlcqkA/exec";

function enviarFormulario(form, curso) {
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        formData.append('curso', curso);

        const btn = form.querySelector('.btn-submit');
        const textoOriginal = btn.textContent;
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        fetch(URL_SCRIPT, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        })
            .then(() => {
                mostrarSucesso(form);
                form.reset();
            })
            .catch(() => {
                alert('Ops! Não foi possível enviar. Tente novamente em instantes.');
            })
            .finally(() => {
                btn.textContent = textoOriginal;
                btn.disabled = false;
            });
    });
}

function mostrarSucesso(form) {
    const antiga = form.parentElement.querySelector('.msg-sucesso');
    if (antiga) antiga.remove();

    const msg = document.createElement('p');
    msg.className = 'msg-sucesso';
    msg.textContent = 'Inscrição enviada com sucesso! ✅';
    form.parentElement.appendChild(msg);

    setTimeout(() => msg.remove(), 5000);
}

enviarFormulario(document.querySelector('#form-casais form'), 'Casais');
enviarFormulario(document.querySelector('#form-noivos form'), 'Noivos');

function doGet(e) {
  return ContentService
    .createTextOutput("O script está no ar! Use POST para enviar dados.")
    .setMimeType(ContentService.MimeType.TEXT);
}
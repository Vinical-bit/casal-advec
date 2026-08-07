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

    let etapaPagamento = 1;
    const telaPix = form.parentElement.querySelector('.tela-pix');
    const btnSubmit = form.querySelector('.btn-submit');
    const btnConfirmarPix = telaPix ? telaPix.querySelector('.btn-confirmar-pix') : null;
    const radiosPagamento = form.querySelectorAll('input[name="pagamento"]');

    function atualizarTextoBotao() {
        const escolhido = form.querySelector('input[name="pagamento"]:checked')?.value;
        btnSubmit.textContent = escolhido === 'PIX' ? 'Ir para o pagamento' : 'Confirmar inscrição';
    }

    radiosPagamento.forEach(radio => radio.addEventListener('change', atualizarTextoBotao));
    atualizarTextoBotao();

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const pagamento = form.querySelector('input[name="pagamento"]:checked')?.value || 'Stand';

        if (pagamento === 'PIX' && etapaPagamento === 1) {
            form.classList.add('oculto');
            telaPix.classList.remove('oculto');
            etapaPagamento = 2;
            return;
        }

        // Descobre qual botão está visível na hora do envio
        const btnAtivo = (etapaPagamento === 2 && btnConfirmarPix) ? btnConfirmarPix : btnSubmit;

        const formData = new FormData(form);
        formData.append('curso', curso);
        formData.append('pagamento', pagamento);

        const textoOriginal = btnAtivo.textContent;
        btnAtivo.textContent = 'Enviando...';
        btnAtivo.disabled = true;

        enviarComRetry(formData, 1)
            .then(() => {
                if (telaPix) telaPix.classList.add('oculto');
                mostrarSucesso(form);
                form.reset();
                etapaPagamento = 1;
                atualizarTextoBotao();
            })
            .catch((err) => {
                console.error('Falha ao enviar formulário:', err);
                alert('Ops! Não foi possível enviar. Tente novamente em instantes.');
            })
            .finally(() => {
                btnAtivo.textContent = textoOriginal;
                btnAtivo.disabled = false;
            });
    });

    if (btnConfirmarPix) {
        btnConfirmarPix.addEventListener('click', () => form.requestSubmit());
    }
}

function copiarPix(id) {
    const campo = document.getElementById(id);
    campo.select();
    navigator.clipboard.writeText(campo.value).then(() => {
        alert('Código Pix copiado!');
    });
}

function mostrarSucesso(form) {
    form.closest('.formulario').classList.add('oculto');
    document.getElementById('confirmacao').classList.remove('oculto');
}

function enviarComRetry(formData, tentativasRestantes) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    return fetch(URL_SCRIPT, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
        signal: controller.signal
    })
        .finally(() => clearTimeout(timeoutId))
        .catch((err) => {
            if (tentativasRestantes > 0) {
                console.warn('Primeira tentativa falhou, tentando de novo...', err);
                return enviarComRetry(formData, tentativasRestantes - 1);
            }
            throw err;
        });
}

function mostrarFormulario(tipo, botao) {
    document.getElementById('form-casais').classList.add('oculto');
    document.getElementById('form-noivos').classList.add('oculto');
    document.getElementById('confirmacao').classList.add('oculto');

    document.querySelectorAll('.btn-curso').forEach(btn => btn.classList.remove('ativo'));

    document.getElementById('form-' + tipo).classList.remove('oculto');
    botao.classList.add('ativo');
}

enviarFormulario(document.querySelector('#form-casais form'), 'Casais');
enviarFormulario(document.querySelector('#form-noivos form'), 'Noivos');

function doGet(e) {
    return ContentService
        .createTextOutput("O script está no ar! Use POST para enviar dados.")
        .setMimeType(ContentService.MimeType.TEXT);
}

function formatarDataBR(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function aplicarMascaraTelefone(input) {
    input.addEventListener('input', function () {
        let valor = input.value.replace(/\D/g, ''); // remove tudo que não é número
        valor = valor.slice(0, 11); // limita a 11 dígitos (DDD + 9 dígitos)

        if (valor.length > 6) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else if (valor.length > 0) {
            valor = valor.replace(/^(\d{0,2})/, '($1');
        }

        input.value = valor;
    });
}

document.querySelectorAll('input[type="tel"]').forEach(aplicarMascaraTelefone);


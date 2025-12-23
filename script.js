let telesenas = [];

// Atualiza a lista visual
function atualizarLista() {
    const ul = document.getElementById("listaTelesenas");
    ul.innerHTML = "";

    telesenas.forEach((codigo, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1} - ${codigo}`;
        ul.appendChild(li);
    });
}

// Scanner de código de barras
function iniciarScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#camera'),
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_13_reader"]
        }
    }, function(err) {
        if (err) {
            alert("Erro ao iniciar câmera");
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(data) {
        const codigo = data.codeResult.code;

        if (!telesenas.includes(codigo)) {
            telesenas.push(codigo);
            atualizarLista();
        }

        Quagga.stop();
        alert("Telesena cadastrada: " + codigo);
    });
}

// Cadastro manual
function adicionarManual() {
    const input = document.getElementById("codigoManual");
    const codigo = input.value.trim();

    if (codigo === "") return;

    if (!telesenas.includes(codigo)) {
        telesenas.push(codigo);
        atualizarLista();
    }

    input.value = "";
}

// Geração do PDF
function gerarPDF() {
    if (telesenas.length === 0) {
        alert("Nenhuma Telesena cadastrada");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Telesenas Cadastradas", 14, 20);

    doc.setFontSize(12);
    telesenas.forEach((codigo, i) => {
        doc.text(`${i + 1} - ${codigo}`, 14, 30 + (i * 8));
    });

    doc.save("telesenas-cadastradas.pdf");
}

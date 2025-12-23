let telesenas = [];
let isProcessing = false; // Trava para evitar leituras duplicadas instantâneas

function atualizarLista() {
    const ul = document.getElementById("listaTelesenas");
    ul.innerHTML = "";

    telesenas.forEach((codigo, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1} - ${codigo}`;
        ul.appendChild(li);
    });
}

function iniciarScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#camera'),
            constraints: {
                width: { min: 640 },
                height: { min: 480 },
                facingMode: "environment", // Força a câmera traseira
                aspectRatio: { min: 1, max: 2 }
            },
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
            // Adicionado mais formatos comuns de Telesena e produtos
            readers: [
                "code_128_reader", 
                "ean_reader", 
                "ean_8_reader", 
                "code_39_reader", 
                "i2of5_reader"
            ]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error(err);
            alert("Erro ao acessar a câmera. Verifique se deu permissão.");
            return;
        }
        console.log("Scanner iniciado com sucesso");
        Quagga.start();
    });

    Quagga.onDetected(function(data) {
        const codigo = data.codeResult.code;

        if (isProcessing || telesenas.includes(codigo)) return;

        isProcessing = true;
        telesenas.push(codigo);
        atualizarLista();
        tocarBip();

        setTimeout(() => {
            isProcessing = false;
        }, 2000);
    });
}

    Quagga.onDetected(function(data) {
        const codigo = data.codeResult.code;

        // Se já estiver processando ou se o código já existir, ignora
        if (isProcessing || telesenas.includes(codigo)) return;

        isProcessing = true;
        
        // Adiciona automaticamente à lista
        telesenas.push(codigo);
        atualizarLista();

        // Feedback visual simples (opcional: pode adicionar um som aqui)
        console.log("Detectado:", codigo);

        // Aguarda 2 segundos antes de permitir a próxima leitura
        // Isso dá tempo de você afastar a Telesena da câmera
        setTimeout(() => {
            isProcessing = false;
        }, 2000);
    });
}

function adicionarManual() {
    const input = document.getElementById("codigoManual");
    const codigo = input.value.trim();

    if (codigo === "" || telesenas.includes(codigo)) return;

    telesenas.push(codigo);
    atualizarLista();
    input.value = "";
}

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
// Función para cargar una imagen desde URL
function loadImage(url) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = "blob";
        xhr.onload = function (e) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const res = event.target.result;
                resolve(res);
            }
            const file = this.response;
            reader.readAsDataURL(file);
        }
        xhr.send();
    });
}

// Inicialización de SignaturePad y eventos
let signaturePad = null;

window.addEventListener('load', async () => {
    const canvas = document.querySelector("canvas");
    canvas.height = canvas.offsetHeight;
    canvas.width = canvas.offsetWidth;

    signaturePad = new SignaturePad(canvas, {});

    const otrosContainer = document.getElementById('otros-container');
    const numeroHijosSelect = document.getElementById('numeroHijos');
    numeroHijosSelect.addEventListener('change', () => {
        if (numeroHijosSelect.value === '7') {
            otrosContainer.style.display = 'block';
        } else {
            otrosContainer.style.display = 'none';
        }
    });

    const form = document.querySelector('#form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let curso = document.getElementById('curso').value;
        let nombre = document.getElementById('nombree').value;
        let codigo = document.getElementById('codigoe').value;
        let cursoc = document.getElementById('cursoc').value;
        let numeroHijos = document.getElementById('numeroHijos').value;
        let otrosText = document.getElementById('otrosText').value;

        // Validar que todos los campos requeridos estén completos
        if (!curso || !nombre || !codigo || !cursoc || !numeroHijos || (numeroHijos === '7' && !otrosText)) {
            alert("Por favor, completa todos los campos requeridos.");
            return;
        }

        // Obtener la firma del canvas o la imagen adjuntada
        let signatureImage;
        if (signaturePad.isEmpty()) {
            // Si no hay firma en el canvas, verificar si se adjuntó una imagen
            const signatureFile = document.getElementById('signature-file').files[0];
            if (signatureFile) {
                signatureImage = await loadImage(URL.createObjectURL(signatureFile));
            }
        } else {
            // Obtener la firma del canvas
            signatureImage = canvas.toDataURL("image/png");
        }

        // Generar el PDF con la firma obtenida
        await generatePDF(curso, nombre, codigo, cursoc, numeroHijos, otrosText, signatureImage);
    });
});

// Función para generar el PDF con los datos y la firma
async function generatePDF(curso, nombre, codigo, cursoc, numeroHijos, otrosText, signatureImage) {
    // Cargar la imagen de fondo del PDF
    const image = await loadImage("SOLICITUD DE RETIRO DE CURSOS(1)_page-0001.jpg");

    // Inicializar un nuevo documento PDF
    const pdf = new jsPDF('p', 'pt', 'letter');

    // Añadir la imagen de fondo al PDF
    pdf.addImage(image, 'PNG', 0, 0, 565, 792);

    // Añadir la imagen de la firma en las coordenadas específicas
    pdf.addImage(signatureImage, 'PNG', 200, 350, 200, 60);

   
    // Configurar el formato y tamaño del texto en el PDF
    pdf.setFontSize(12);

    // Obtener la fecha actual
    const date = new Date();
    var day = date.getUTCDate().toString().padStart(2, '0');
    var month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    var year = date.getUTCFullYear().toString();

    // Formatear la fecha como DD/MM/YYYY
    var formattedDate = '' + day + '/' + month + '/' + year + '';

    // Añadir la fecha en el PDF
    pdf.text(formattedDate, 275, 135);

    // Ajustar el tamaño del texto
    pdf.setFontSize(10);

    // Añadir los detalles del estudiante y curso en el PDF
    pdf.text(nombre, 260, 105);
    pdf.text(curso, 260, 75);
    pdf.text(codigo, 275, 90);
    pdf.text(cursoc, 170, 202);

    // Configurar el color de fondo para los círculos
    pdf.setFillColor(0, 0, 0);

    // Definir las coordenadas de los círculos según el motivo de retiro
    const circles = {
        1: 358,
        2: 385,
        3: 400,
        4: 425,
        5: 443,
        6: 458,
        7: 478
    };

    // Añadir el círculo correspondiente si existe
    if (circles[numeroHijos]) {
        pdf.circle(circles[numeroHijos], 202, 4, 'FD');
    }

    // Añadir el texto adicional si el motivo es "Otros"
    if (numeroHijos === '7' && otrosText) {
        pdf.text(otrosText, 220, 364); // Posición del texto adicional
    }

    // Guardar el PDF con un nombre específico
    pdf.save("Solicitud de retiro de curso.pdf");
}
// Protect Tool Logic
let selectedFile = null;
let protectedPdfBlob = null;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const optionsPanel = document.getElementById('options-panel');
    const processBtn = document.getElementById('process-btn');
    const successState = document.getElementById('success-state');
    const downloadBtn = document.getElementById('download-btn');
    const fileInput = document.getElementById('file-input');
    const filenameDisplay = document.getElementById('filename-display');
    const passwordInput = document.getElementById('password-input');

    PDFUtils.setupDropZone('drop-zone', 'file-input', handleFiles);

    function handleFiles(files) {
        const file = files[0];
        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        selectedFile = file;
        filenameDisplay.textContent = file.name;
        dropZone.style.display = 'none';
        optionsPanel.style.display = 'block';
    }

    processBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        const password = passwordInput.value;
        if (!password) {
            alert('Please enter a password.');
            return;
        }

        try {
            PDFUtils.showLoading(processBtn, 'Encrypting...');

            const arrayBuffer = await PDFUtils.readFileAsArrayBuffer(selectedFile);
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

            const pdfBytes = await pdfDoc.save({
                userPassword: password,
                ownerPassword: password // Setting both to be safe
            });

            protectedPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

            optionsPanel.style.display = 'none';
            successState.style.display = 'block';

        } catch (error) {
            console.error(error);
            alert('Error protecting PDF.');
        } finally {
            PDFUtils.hideLoading(processBtn);
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (protectedPdfBlob) {
            PDFUtils.downloadFile(protectedPdfBlob, `${selectedFile.name.replace(/\.pdf$/i, '')}_protected_pdfbazi.pdf`);
        }
    });
});

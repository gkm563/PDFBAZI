// excel-to-pdf.js
// Handles XLSX to PDF conversion using SheetJS (xlsx) and html2pdf.js

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const optionsPanel = document.getElementById('options-panel');
    const successState = document.getElementById('success-state');
    const previewContainer = document.getElementById('preview-container');
    const filenameDisplay = document.getElementById('filename-display');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');

    let currentFile = null;

    // Use shared utility for drag and drop
    window.PDFUtils.setupDropZone('drop-zone', 'file-input', handleFiles);

    function handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];
        const extension = file.name.split('.').pop().toLowerCase();

        if (extension !== 'xls' && extension !== 'xlsx') {
            alert('Please select an Excel file (.xls or .xlsx)');
            return;
        }

        currentFile = file;
        filenameDisplay.textContent = file.name;

        // Show options panel, hide drop zone
        dropZone.style.display = 'none';
        optionsPanel.style.display = 'block';

        // Render Preview
        renderPreview(file);
    }

    async function renderPreview(file) {
        previewContainer.innerHTML = '<p style="text-align: center; color: #aaa;">Generating preview...</p>';

        try {
            const arrayBuffer = await window.PDFUtils.readFileAsArrayBuffer(file);
            const workbook = XLSX.read(arrayBuffer);

            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to HTML
            const html = XLSX.utils.sheet_to_html(worksheet);

            previewContainer.innerHTML = `
                <div class="excel-content" style="font-family: 'Inter', sans-serif; font-size: 0.8rem; overflow-x: auto;">
                    <style>
                        table { border-collapse: collapse; width: 100%; }
                        td, th { border: 1px solid #ddd; padding: 4px; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                    </style>
                    ${html}
                </div>
            `;

        } catch (error) {
            console.error('Error reading file:', error);
            previewContainer.innerHTML = '<p style="text-align: center; color: red;">Error reading file.</p>';
        }
    }

    processBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        window.PDFUtils.showLoading(processBtn, 'Converting...');

        try {
            const element = previewContainer.querySelector('.excel-content') || previewContainer;

            // Generate PDF from the previewed HTML
            const opt = {
                margin: [5, 5, 5, 5],
                filename: currentFile.name.replace(/\.(xls|xlsx)$/i, '_pdfbazi.pdf'),
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();

            // Since html2pdf triggers download immediately, we just show success state
            setTimeout(() => {
                optionsPanel.style.display = 'none';
                successState.style.display = 'block';
                window.PDFUtils.hideLoading(processBtn);

                downloadBtn.onclick = () => {
                    html2pdf().set(opt).from(element).save();
                };

            }, 1000);

        } catch (error) {
            console.error('Conversion error:', error);
            alert('An error occurred during conversion.');
            window.PDFUtils.hideLoading(processBtn);
        }
    });

});

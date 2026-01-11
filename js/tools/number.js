// Number Tool Logic
let selectedFile = null;
let numberedPdfBlob = null;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const optionsPanel = document.getElementById('options-panel');
    const processBtn = document.getElementById('process-btn');
    const successState = document.getElementById('success-state');
    const downloadBtn = document.getElementById('download-btn');
    const fileInput = document.getElementById('file-input');
    const filenameDisplay = document.getElementById('filename-display');
    const positionSelect = document.getElementById('position-select');

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

        try {
            PDFUtils.showLoading(processBtn, 'Adding Numbers...');

            const arrayBuffer = await PDFUtils.readFileAsArrayBuffer(selectedFile);
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const totalPages = pages.length;
            const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

            const position = positionSelect.value; // e.g. 'bottom-center'
            const margin = 20;

            pages.forEach((page, idx) => {
                const { width, height } = page.getSize();
                const text = `${idx + 1} / ${totalPages}`;
                const textSize = 12;
                const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
                const textHeight = helveticaFont.heightAtSize(textSize);

                let x, y;

                // X Coordinate
                if (position.includes('left')) x = margin;
                else if (position.includes('right')) x = width - textWidth - margin;
                else x = (width / 2) - (textWidth / 2); // Center

                // Y Coordinate
                if (position.includes('top')) y = height - margin - textHeight;
                else y = margin; // Bottom

                page.drawText(text, {
                    x,
                    y,
                    size: textSize,
                    font: helveticaFont,
                    color: PDFLib.rgb(0, 0, 0),
                });
            });

            const pdfBytes = await pdfDoc.save();
            numberedPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

            optionsPanel.style.display = 'none';
            successState.style.display = 'block';

        } catch (error) {
            console.error(error);
            alert('Error adding page numbers.');
        } finally {
            PDFUtils.hideLoading(processBtn);
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (numberedPdfBlob) {
            PDFUtils.downloadFile(numberedPdfBlob, `${selectedFile.name.replace(/\.pdf$/i, '')}_numbered_pdfbazi.pdf`);
        }
    });
});

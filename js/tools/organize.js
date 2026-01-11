// organize.js
// Organize PDF pages using pdf-lib

document.addEventListener('DOMContentLoaded', () => {
    const { PDFDocument } = PDFLib;

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const optionsPanel = document.getElementById('options-panel');
    const successState = document.getElementById('success-state');
    const filenameDisplay = document.getElementById('filename-display');
    const pageOrderInput = document.getElementById('page-order');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');

    let currentFile = null;
    let originalFilename = '';

    window.PDFUtils.setupDropZone('drop-zone', 'file-input', handleFiles);

    function handleFiles(files) {
        if (files.length === 0) return;
        currentFile = files[0];
        originalFilename = currentFile.name;
        filenameDisplay.textContent = originalFilename;

        // Helper: Pre-fill input with all pages as a default?
        // Let's just set focus.

        dropZone.style.display = 'none';
        optionsPanel.style.display = 'block';
    }

    processBtn.addEventListener('click', async () => {
        const orderStr = pageOrderInput.value;
        if (!orderStr.trim()) {
            alert('Please enter a page order (e.g., 1,2,3)');
            return;
        }

        window.PDFUtils.showLoading(processBtn, 'Organizing...');

        try {
            const arrayBuffer = await window.PDFUtils.readFileAsArrayBuffer(currentFile);
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const totalPages = pdfDoc.getPageCount();

            // Create new PDF
            const newPdf = await PDFDocument.create();

            // Parse input string "1, 3-5, 2"
            const pagesToKeep = [];
            const parts = orderStr.split(',');

            for (const part of parts) {
                const p = part.trim();
                if (p.includes('-')) {
                    const [start, end] = p.split('-').map(num => parseInt(num));
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) {
                            pagesToKeep.push(i);
                        }
                    }
                } else {
                    const pageNum = parseInt(p);
                    if (!isNaN(pageNum)) {
                        pagesToKeep.push(pageNum);
                    }
                }
            }

            // Validate pages
            const validPages = pagesToKeep.filter(p => p >= 1 && p <= totalPages);

            if (validPages.length === 0) {
                alert('Invalid page numbers. Document has ' + totalPages + ' pages.');
                window.PDFUtils.hideLoading(processBtn);
                return;
            }

            // Copy pages (0-indexed in array)
            const copiedPages = await newPdf.copyPages(pdfDoc, validPages.map(p => p - 1));
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            optionsPanel.style.display = 'none';
            successState.style.display = 'block';
            window.PDFUtils.hideLoading(processBtn);

            downloadBtn.onclick = () => {
                const newFilename = 'organized_' + originalFilename;
                window.PDFUtils.downloadFile(blob, newFilename);
            };

        } catch (error) {
            console.error('Organize error:', error);
            alert('Failed to organize PDF. Invalid input or encrypted file.');
            window.PDFUtils.hideLoading(processBtn);
        }
    });

});

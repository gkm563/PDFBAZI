// Merge Tool Logic

let selectedFiles = []; // Array of File objects

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileListContainer = document.getElementById('file-list-container');
    const actionButtons = document.getElementById('action-buttons');
    const mergeBtn = document.getElementById('merge-btn');
    const addMoreBtn = document.getElementById('add-more-btn');
    const successState = document.getElementById('success-state');
    const downloadBtn = document.getElementById('download-btn');
    const fileInput = document.getElementById('file-input');

    let mergedPdfBlob = null;

    // Initialize Drop Zone
    PDFUtils.setupDropZone('drop-zone', 'file-input', handleFiles);

    // Initial button click handler for the big 'Select PDF files' button
    // The dropzone click handler in utils.js already covers this via bubbling or direct attachment, 
    // but we can ensure the button specifically triggers it too if needed.
    // In utils.js: dropZone.addEventListener('click', () => fileInput.click()); 
    // This covers the whole area including the button.

    // Add More Button
    addMoreBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle new files
    function handleFiles(files) {
        const newFiles = Array.from(files).filter(file => file.type === 'application/pdf');

        if (newFiles.length === 0) {
            alert('Please select valid PDF files.');
            return;
        }

        selectedFiles = [...selectedFiles, ...newFiles];
        updateUI();
    }

    // Update UI based on selected files
    function updateUI() {
        if (selectedFiles.length > 0) {
            dropZone.style.display = 'none';
            fileListContainer.style.display = 'grid';
            actionButtons.style.display = 'flex';
            renderFileList();
        } else {
            dropZone.style.display = 'block';
            fileListContainer.style.display = 'none';
            actionButtons.style.display = 'none';
        }
    }

    // Render list of files
    function renderFileList() {
        fileListContainer.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `
                <div class="file-info">
                    <ion-icon name="document" class="file-icon"></ion-icon>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${PDFUtils.formatBytes(file.size)}</div>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFile(${index})">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            `;
            fileListContainer.appendChild(item);
        });
    }

    // Expose removeFile to window
    window.removeFile = (index) => {
        selectedFiles.splice(index, 1);
        updateUI();
    };

    // Merge Logic
    mergeBtn.addEventListener('click', async () => {
        if (selectedFiles.length < 2) {
            alert('Please select at least 2 PDF files to merge.');
            return;
        }

        try {
            PDFUtils.showLoading(mergeBtn, 'Merging PDFs...');

            // Create a new PDFDocument
            const mergedPdf = await PDFLib.PDFDocument.create();

            for (const file of selectedFiles) {
                const arrayBuffer = await PDFUtils.readFileAsArrayBuffer(file);
                const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            mergedPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

            // Show success
            fileListContainer.style.display = 'none';
            actionButtons.style.display = 'none';
            successState.style.display = 'block';

        } catch (error) {
            console.error(error);
            alert('An error occurred while merging PDFs. Please try again.');
        } finally {
            PDFUtils.hideLoading(mergeBtn);
        }
    });

    // Download Handler
    downloadBtn.addEventListener('click', () => {
        if (mergedPdfBlob) {
            PDFUtils.downloadFile(mergedPdfBlob, 'merged_pdfbazi.pdf');
        }
    });

});

// word-to-pdf.js
// Handles DOCX to PDF conversion using mammoth.js and html2pdf.js

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

        if (extension !== 'doc' && extension !== 'docx') {
            alert('Please select a Word document (.doc or .docx)');
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

            // Using mammoth to convert docx to html
            mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                .then(displayResult)
                .catch(handleError);

            function displayResult(result) {
                const html = result.value; // The generated HTML
                const messages = result.messages; // Any messages, such as warnings during conversion

                previewContainer.innerHTML = `
                    <div class="word-content" style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #333;">
                        ${html}
                    </div>
                `;
            }

            function handleError(err) {
                console.error(err);
                previewContainer.innerHTML = '<p style="text-align: center; color: red;">Error generating preview. File might be corrupted or incompatible.</p>';
            }

        } catch (error) {
            console.error('Error reading file:', error);
            previewContainer.innerHTML = '<p style="text-align: center; color: red;">Error reading file.</p>';
        }
    }

    processBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        window.PDFUtils.showLoading(processBtn, 'Converting...');

        try {
            const element = previewContainer.querySelector('.word-content') || previewContainer;

            // Generate PDF from the previewed HTML
            const opt = {
                margin: [10, 10, 10, 10], // top, left, bottom, right in mm
                filename: currentFile.name.replace(/\.(doc|docx)$/i, '_pdfbazi.pdf'),
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // html2pdf().set(opt).from(element).save();
            // We want to handle the blob manually to support our "success state" UI flow
            // But html2pdf is mostly for direct save. Let's try to simulate the flow.

            await html2pdf().set(opt).from(element).save();

            // Since html2pdf triggers download immediately, we just show success state
            setTimeout(() => {
                optionsPanel.style.display = 'none';
                successState.style.display = 'block';
                window.PDFUtils.hideLoading(processBtn);

                // Update download button behavior to just reload or re-trigger? 
                // Since user already downloaded, maybe "Download Again" ideally re-triggers.
                // But html2pdf doesn't easily return blob without some work.
                // For simplicity in this "best effort" client side tool, 
                // the primary action (save()) happens on "Convert".
                // The "Download" button on success screen can reload page or trigger save again.

                downloadBtn.onclick = () => {
                    html2pdf().set(opt).from(element).save();
                };

            }, 1000); // Small delay to allow save to start

        } catch (error) {
            console.error('Conversion error:', error);
            alert('An error occurred during conversion.');
            window.PDFUtils.hideLoading(processBtn);
        }
    });

});

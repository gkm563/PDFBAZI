// html-to-pdf.js
// Handles HTML to PDF conversion using html2pdf.js

document.addEventListener('DOMContentLoaded', () => {
    const htmlInput = document.getElementById('html-input');
    const previewContainer = document.getElementById('preview-container');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Live Preview Logic
    htmlInput.addEventListener('input', () => {
        const html = htmlInput.value;
        previewContainer.innerHTML = html;
    });

    // Default placeholder
    if (!htmlInput.value) {
        htmlInput.value = `<h1>Welcome to PDFBAZI</h1>
<p>This is a sample HTML content. You can edit this text.</p>
<hr>
<ul>
  <li>Fast</li>
  <li>Secure</li>
  <li>Free</li>
</ul>`;
        previewContainer.innerHTML = htmlInput.value;
    }

    processBtn.addEventListener('click', async () => {
        if (!htmlInput.value.trim()) {
            alert('Please enter some HTML code.');
            return;
        }

        window.PDFUtils.showLoading(processBtn, 'Converting...');

        try {
            // Generate PDF from the preview container
            const opt = {
                margin: 10,
                filename: 'document_pdfbazi.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(previewContainer).save();

            // After "save", show download button as a way to re-download
            setTimeout(() => {
                window.PDFUtils.hideLoading(processBtn);
                processBtn.style.display = 'none';
                downloadBtn.style.display = 'inline-flex';

                downloadBtn.onclick = () => {
                    html2pdf().set(opt).from(previewContainer).save();
                };

            }, 1000);

        } catch (error) {
            console.error('Conversion error:', error);
            alert('An error occurred during conversion.');
            window.PDFUtils.hideLoading(processBtn);
        }
    });

});

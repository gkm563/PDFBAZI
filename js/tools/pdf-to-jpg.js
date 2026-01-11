// PDF to JPG Tool Logic

// Set worker src
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let selectedFile = null;
let zipBlob = null;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const optionsPanel = document.getElementById('options-panel');
    const convertBtn = document.getElementById('convert-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const successState = document.getElementById('success-state');
    const downloadBtn = document.getElementById('download-btn');
    const fileInput = document.getElementById('file-input');
    const filenameDisplay = document.getElementById('filename-display');

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

    convertBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        try {
            optionsPanel.style.display = 'none';
            progressContainer.style.display = 'block';

            const arrayBuffer = await PDFUtils.readFileAsArrayBuffer(selectedFile);
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const totalPages = pdf.numPages;

            const zip = new JSZip();
            const imgFolder = zip.folder("images");

            for (let i = 1; i <= totalPages; i++) {
                // Update Progress
                const percent = Math.round(((i - 1) / totalPages) * 100);
                progressBar.style.width = `${percent}%`;
                progressText.innerText = `Processing page ${i} of ${totalPages}...`;

                // Render Page
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 }); // Scale 2 for better quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // To Blob
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
                imgFolder.file(`page-${i}.jpg`, blob);
            }

            progressBar.style.width = '100%';
            progressText.innerText = 'Finalizing ZIP...';

            zipBlob = await zip.generateAsync({ type: "blob" });

            progressContainer.style.display = 'none';
            successState.style.display = 'block';

        } catch (error) {
            console.error(error);
            alert('Error converting PDF to images.');
            optionsPanel.style.display = 'block'; // Reset
            progressContainer.style.display = 'none';
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (zipBlob) {
            saveAs(zipBlob, `${selectedFile.name.replace(/\.pdf$/i, '')}_images_pdfbazi.zip`);
        }
    });

});

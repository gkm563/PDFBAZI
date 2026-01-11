// JPG to PDF Tool Logic

let selectedImages = [];
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileListContainer = document.getElementById('file-list-container');
    const actionButtons = document.getElementById('action-buttons');
    const convertBtn = document.getElementById('convert-btn');
    const addMoreBtn = document.getElementById('add-more-btn');
    const successState = document.getElementById('success-state');
    const downloadBtn = document.getElementById('download-btn');
    const fileInput = document.getElementById('file-input');
    const orientationSelect = document.getElementById('orientation-select');

    let resultPdfBlob = null;

    PDFUtils.setupDropZone('drop-zone', 'file-input', handleFiles);

    addMoreBtn.addEventListener('click', () => {
        fileInput.click();
    });

    function handleFiles(files) {
        const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (newFiles.length === 0) {
            alert('Please select valid image files (JPG/PNG).');
            return;
        }
        selectedImages = [...selectedImages, ...newFiles];
        updateUI();
    }

    function updateUI() {
        if (selectedImages.length > 0) {
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

    function renderFileList() {
        fileListContainer.innerHTML = '';
        selectedImages.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'file-item';

            // Create a small preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '40px';
                img.style.height = '40px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                item.querySelector('.file-icon-area').innerHTML = ''; // Clear icon
                item.querySelector('.file-icon-area').appendChild(img);
            };
            reader.readAsDataURL(file);

            item.innerHTML = `
                <div class="file-info">
                    <div class="file-icon-area" style="width: 40px; text-align: center;">
                        <ion-icon name="image" class="file-icon"></ion-icon>
                    </div>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${PDFUtils.formatBytes(file.size)}</div>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeImage(${index})">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            `;
            fileListContainer.appendChild(item);
        });
    }

    window.removeImage = (index) => {
        selectedImages.splice(index, 1);
        updateUI();
    };

    convertBtn.addEventListener('click', async () => {
        if (selectedImages.length === 0) return;

        try {
            PDFUtils.showLoading(convertBtn, 'Converting...');

            const orientation = orientationSelect.value;
            const doc = new jsPDF({
                orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // If "fit", using 'p', 'mm', [width, height] for each page might be needed, 
            // but standard jsPDF usage is simpler if we stick to A4 and scaling.
            // For simple college project: A4 is standard. Fit mode: custom size.

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            for (let i = 0; i < selectedImages.length; i++) {
                const file = selectedImages[i];
                const dataUrl = await PDFUtils.readFileAsDataURL(file);

                if (i > 0) doc.addPage();

                // Load image to get dimensions
                const img = new Image();
                img.src = dataUrl;
                await new Promise(resolve => img.onload = resolve);

                // Calculate aspect ratio
                const imgRatio = img.width / img.height;
                const pageRatio = pageWidth / pageHeight;

                let finalW, finalH;

                if (orientation === 'fit') {
                    // Reset current page to image size
                    // Note: jsPDF addPage takes format but initial page is set by constructor.
                    // Changing page size dynamically:
                    doc.deletePage(i + 1); // Delete the A4 page we just added or started with
                    doc.addPage([img.width * 0.264583, img.height * 0.264583]); // px to mm approx
                    doc.addImage(dataUrl, 'JPEG', 0, 0, img.width * 0.264583, img.height * 0.264583);
                } else {
                    // Fit to A4 maintaining aspect ratio
                    if (imgRatio > pageRatio) {
                        finalW = pageWidth - 20; // 10mm margin
                        finalH = finalW / imgRatio;
                    } else {
                        finalH = pageHeight - 20;
                        finalW = finalH * imgRatio;
                    }
                    const x = (pageWidth - finalW) / 2;
                    const y = (pageHeight - finalH) / 2;
                    doc.addImage(dataUrl, 'JPEG', x, y, finalW, finalH);
                }
            }

            resultPdfBlob = doc.output('blob');

            fileListContainer.style.display = 'none';
            actionButtons.style.display = 'none';
            successState.style.display = 'block';

        } catch (error) {
            console.error(error);
            alert('Error converting images.');
        } finally {
            PDFUtils.hideLoading(convertBtn);
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (resultPdfBlob) {
            PDFUtils.downloadFile(resultPdfBlob, 'images_converted_pdfbazi.pdf');
        }
    });

});

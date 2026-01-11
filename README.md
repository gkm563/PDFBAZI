# PDFBAZI - Modern PDF Tool Suite

**PDFBAZI** is a comprehensive, client-side web application for manipulating PDF documents. Built with HTML5, CSS3, and Vanilla JavaScript, it offers a secure and fast way to manage PDFs directly in the browser without uploading files to a server.

## 🚀 Features

*   **Merge PDF**: Combine multiple PDF files into one.
*   **Split PDF**: Extract specific pages or ranges from a PDF.
*   **Compress PDF**: Optimize PDF file size.
*   **JPG to PDF**: Convert images to PDF documents.
*   **PDF to JPG**: Extract pages as ID images.
*   **Rotate PDF**: Rotate pages permanently.
*   **Unlock/Protect PDF**: Encrypt documents with passwords.
*   **Page Numbers**: Add page numbering to documents.

## 🛠 Tech Stack

*   **Frontend**: HTML5, CSS3 (Custom Properties, Flexbox/Grid)
*   **Logic**: Vanilla JavaScript (ES6+)
*   **Libraries**:
    *   `pdf-lib`: For PDF modification (Merge, Split, Rotate, etc.)
    *   `pdfjs-dist`: For rendering PDF pages (PDF to JPG)
    *   `jsPDF`: For creating PDFs from images
    *   `JSZip`: For bundling downloaded images
    *   `IonIcons`: For UI icons

## 📦 Installation & Usage

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/pdfbazi.git
    ```
2.  **Open the project**:
    Simply open `index.html` in your web browser. No build step or server required!

3.  **Deploy**:
    This project is static and ready for deployment on:
    *   Netlify (Drag & drop the folder)
    *   Vercel
    *   GitHub Pages

## 🔒 Privacy

All operations are performed **Client-Side** in your browser. Your files are never uploaded to any server, ensuring 100% privacy and security.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

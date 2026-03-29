// PWA Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registered successfully!', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------
    // 1. Dynamic Date (Marathi Format)
    // ---------------------------------
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('mr-IN', dateOptions);
    document.getElementById('current-date').innerText = 'दिनांक: ' + dateStr;

    // ---------------------------------
    // 2. Elements Configuration
    // ---------------------------------
    const logoUpload = document.getElementById('logo-upload');
    const logoPreview = document.getElementById('logo-preview');
    const logoPlaceholder = document.getElementById('logo-placeholder');

    const imageUpload = document.getElementById('article-image-upload');
    const articleInput = document.getElementById('article-input');
    const articleContentContainer = document.getElementById('article-content');

    const downloadBtn = document.getElementById('download-btn');
    const canvasElement = document.getElementById('newspaper-canvas');

    let articleImageSrc = null;

    // ---------------------------------
    // 3. Real-Time UI Updates
    // ---------------------------------
    const updatePreview = () => {
        const text = articleInput.value.trim();
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');

        let htmlContent = '';

        // Inject the user-defined image into the flow
        if (articleImageSrc) {
            htmlContent += `
                <div class="article-image-wrapper">
                    <img src="${articleImageSrc}" alt="Article Highlight">
                </div>
            `;
        }

        // Generate Paragraph HTML
        paragraphs.forEach(p => {
            htmlContent += `<p>${p}</p>`;
        });

        // Push to Canvas
        articleContentContainer.innerHTML = htmlContent;
    };

    // ---------------------------------
    // 4. File Upload Handlers
    // ---------------------------------
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Convert to base64 for CORS bypass with html2canvas later
            const reader = new FileReader();
            reader.onload = function(event) {
                logoPreview.src = event.target.result;
                logoPreview.style.display = 'block';
                logoPlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                articleImageSrc = event.target.result;
                updatePreview();
            };
            reader.readAsDataURL(file);
        } else {
            articleImageSrc = null;
            updatePreview();
        }
    });

    // Handle Rich Text Area Inputs
    articleInput.addEventListener('input', updatePreview);

    // Initial default placeholder state
    articleInput.value = "येथे आपला लेख किंवा मुलाखत पेस्ट करा...\n\nही एक प्रात्यक्षिक ओळ आहे. डावीकडे जाऊन लेख किंवा बातमीचे स्वरूप पाहू शकता. मल्लविद्या चळवळीचा प्रसार करण्यासाठी हा एक चांगला उपक्रम आहे.\n\nतुम्ही मोठे लेख येथे टाकू शकता आणि ते दोन रकान्यांत (columns) अत्यंत आकर्षकरीत्या विभागले जातील.";
    updatePreview();

    // ---------------------------------
    // 5. HD Canvas Download Export
    // ---------------------------------
    downloadBtn.addEventListener('click', () => {
        const originalText = downloadBtn.innerText;
        downloadBtn.innerText = "Exporting HD Image...";
        downloadBtn.disabled = true;

        // Html2canvas High resolution setup
        // It relies completely on standard DOM sizing.
        // Bypassing CSS scaling that might occur on mobile viewports.

        html2canvas(canvasElement, {
            scale: 4, // 4x Export resolution ensures absolutely zero pixelation on WhatsApp Zoom
            useCORS: true, 
            backgroundColor: '#ffffff',
            logging: false,
            // To guarantee capturing the full flowing heights
            windowWidth: canvasElement.scrollWidth,
            windowHeight: canvasElement.scrollHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            // Initiate File Download
            const link = document.createElement('a');
            link.download = `kusti-mallavidya-${Date.now()}.png`;
            link.href = imgData;
            link.click();
            
            // Re-enable Dashboard
            downloadBtn.innerText = originalText;
            downloadBtn.disabled = false;
        }).catch(err => {
            console.error('HD Export Error:', err);
            alert('चित्र तयार करताना काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.');
            downloadBtn.innerText = originalText;
            downloadBtn.disabled = false;
        });
    });
});

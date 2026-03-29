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
    const wordCountSpan = document.getElementById('word-count');

    // Author Details Elements
    const authorNameInput = document.getElementById('author-name');
    const authorRoleInput = document.getElementById('author-role');
    const authorImageUpload = document.getElementById('author-image-upload');
    
    const authorByline = document.getElementById('author-byline');
    const authorPhotoPreview = document.getElementById('author-photo-preview');
    const authorNameDisplay = document.getElementById('author-name-display');
    const authorRoleDisplay = document.getElementById('author-role-display');

    const downloadBtn = document.getElementById('download-btn');
    const canvasElement = document.getElementById('newspaper-canvas');

    let articleImageSrc = null;
    let authorImageSrc = localStorage.getItem('kusti-author-photo') || null;

    // ---------------------------------
    // 3. Load from LocalStorage
    // ---------------------------------
    if (localStorage.getItem('kusti-logo')) {
        logoPreview.src = localStorage.getItem('kusti-logo');
        logoPreview.style.display = 'block';
        logoPlaceholder.style.display = 'none';
    }

    authorNameInput.value = localStorage.getItem('kusti-author-name') || '';
    authorRoleInput.value = localStorage.getItem('kusti-author-role') || '';

    // ---------------------------------
    // 4. Real-Time UI Updates
    // ---------------------------------
    const updatePreview = () => {
        // Update Article Text
        const text = articleInput.value.trim();
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        
        // Word Count
        const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
        wordCountSpan.innerText = `शब्द: ${words}`;
        if (words > 320) wordCountSpan.style.color = '#8b0000'; // Warn if too long
        else wordCountSpan.style.color = '#555';

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

    const updateAuthorPreview = () => {
        const name = authorNameInput.value.trim();
        const role = authorRoleInput.value.trim();
        
        // Save to cache
        localStorage.setItem('kusti-author-name', name);
        localStorage.setItem('kusti-author-role', role);

        if (name || role || authorImageSrc) {
            authorByline.style.display = 'flex';
            if (authorImageSrc) {
                authorPhotoPreview.src = authorImageSrc;
                authorPhotoPreview.style.display = 'block';
            } else {
                authorPhotoPreview.style.display = 'none';
            }
            authorNameDisplay.innerText = name ? 'लेखक: ' + name : '';
            authorRoleDisplay.innerText = role;
        } else {
            authorByline.style.display = 'none';
        }
    };

    // ---------------------------------
    // 5. File Upload Handlers
    // ---------------------------------
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const b64 = event.target.result;
                logoPreview.src = b64;
                logoPreview.style.display = 'block';
                logoPlaceholder.style.display = 'none';
                localStorage.setItem('kusti-logo', b64); // Save logo
            };
            reader.readAsDataURL(file);
        }
    });

    authorImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                authorImageSrc = event.target.result;
                localStorage.setItem('kusti-author-photo', authorImageSrc);
                updateAuthorPreview();
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

    // Handle Inputs
    articleInput.addEventListener('input', updatePreview);
    authorNameInput.addEventListener('input', updateAuthorPreview);
    authorRoleInput.addEventListener('input', updateAuthorPreview);

    // Initial default placeholder state
    articleInput.value = "येथे आपला लेख किंवा मुलाखत पेस्ट करा...\n\nही एक प्रात्यक्षिक ओळ आहे. डावीकडे जाऊन लेख किंवा बातमीचे स्वरूप पाहू शकता. मल्लविद्या चळवळीचा प्रसार करण्यासाठी हा एक चांगला उपक्रम आहे.\n\nतुम्ही मोठे लेख येथे टाकू शकता आणि ते दोन रकान्यांत (columns) अत्यंत आकर्षकरीत्या विभागले जातील.";
    
    // Initial Render
    updatePreview();
    updateAuthorPreview();

    // ---------------------------------
    // 6. HD Canvas Download Export
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

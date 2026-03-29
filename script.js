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
    // 1. Manual Date Input Setup
    // ---------------------------------
    const manualDateInput = document.getElementById('manual-date');
    const currentDateDisplay = document.getElementById('current-date');
    const savedDate = localStorage.getItem('kusti-date') || '';
    manualDateInput.value = savedDate;
    currentDateDisplay.innerText = savedDate ? savedDate : 'येथे दिनांक दिसेल';

    manualDateInput.addEventListener('input', (e) => {
        const val = e.target.value;
        currentDateDisplay.innerText = val ? val : 'येथे दिनांक दिसेल';
        localStorage.setItem('kusti-date', val);
    });

    // ---------------------------------
    // 1.5 Theme Selector Setup
    // ---------------------------------
    const themeSelector = document.getElementById('theme-selector');
    const savedTheme = localStorage.getItem('kusti-theme') || '#8b0000';
    themeSelector.value = savedTheme;
    document.documentElement.style.setProperty('--primary-color', savedTheme);

    themeSelector.addEventListener('change', (e) => {
        const val = e.target.value;
        document.documentElement.style.setProperty('--primary-color', val);
        localStorage.setItem('kusti-theme', val);
    });

    // ---------------------------------
    // 2. Elements Configuration
    // ---------------------------------
    const articleInput = document.getElementById('article-input');
    const articleContentContainer = document.getElementById('article-content');
    const wordCountSpan = document.getElementById('word-count');

    // Branding
    const logoUpload = document.getElementById('logo-upload');
    const logoPreview = document.getElementById('logo-preview');
    const logoPlaceholder = document.getElementById('logo-placeholder');

    // Author
    const authorNameInput = document.getElementById('author-name');
    const authorRoleInput = document.getElementById('author-role');
    const authorImageUpload = document.getElementById('author-image-upload');
    
    // Author Preview
    const authorByline = document.getElementById('author-byline');
    const authorNameDisplay = document.getElementById('author-name-display');
    const authorRoleDisplay = document.getElementById('author-role-display');
    const authorPhotoPreview = document.getElementById('author-photo-preview');

    // Additional Media
    const imageUpload = document.getElementById('article-image-upload');
    const downloadBtn = document.getElementById('download-btn');
    const canvasElement = document.getElementById('newspaper-canvas');

    let articleImageSrc = null;
    let authorImageSrc = localStorage.getItem('kusti-author-photo') || null;

    // Load Cached Logo
    const cachedLogo = localStorage.getItem('kusti-logo');
    if (cachedLogo) {
        logoPreview.src = cachedLogo;
        logoPreview.style.display = 'block';
        logoPlaceholder.style.display = 'none';
    }

    // Load Cached Author
    authorNameInput.value = localStorage.getItem('kusti-author-name') || '';
    authorRoleInput.value = localStorage.getItem('kusti-author-role') || '';

    // ---------------------------------
    // 3. Document Updater Logic
    // ---------------------------------
    const updatePreview = () => {
        const text = articleInput.value.trim();
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        
        // Word Count
        const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
        wordCountSpan.innerText = `शब्द: ${words}`;
        
        let colCount = 2;
        let fontSize = "24px";
        let lineHeight = "1.8";
        let pMargin = "0.7em";
        let colGap = "45px";

        if (words === 0) {
            colCount = 2; fontSize = "24px";
        } else if (words <= 350) {
            colCount = 2; fontSize = "21.5px"; lineHeight = "1.7"; pMargin = "0.7em"; colGap = "45px";
        } else if (words <= 700) {
            colCount = 3; fontSize = "17px"; lineHeight = "1.55"; pMargin = "0.55em"; colGap = "40px";
        } else if (words <= 1100) {
            colCount = 4; fontSize = "14.5px"; lineHeight = "1.45"; pMargin = "0.5em"; colGap = "35px";
        } else if (words <= 1500) {
            colCount = 4; fontSize = "13px"; lineHeight = "1.4"; pMargin = "0.45em"; colGap = "30px";
        } else if (words <= 1800) {
            colCount = 5; fontSize = "11.5px"; lineHeight = "1.35"; pMargin = "0.4em"; colGap = "25px";
        } else if (words <= 2200) {
            colCount = 6; fontSize = "10.5px"; lineHeight = "1.3"; pMargin = "0.3em"; colGap = "20px";
        } else {
            // max threshold fallback for massive texts
            colCount = 6; fontSize = "9.5px"; lineHeight = "1.25"; pMargin = "0.25em"; colGap = "20px";
        }

        // Apply dynamic styles to canvas content wrapper
        articleContentContainer.style.setProperty('--dynamic-col-count', colCount);
        articleContentContainer.style.setProperty('--dynamic-font-size', fontSize);
        articleContentContainer.style.setProperty('--dynamic-line-height', lineHeight);
        articleContentContainer.style.setProperty('--dynamic-margin-bottom', pMargin);
        articleContentContainer.style.setProperty('--dynamic-col-gap', colGap);

        let htmlContent = '';

        // Inject the user-defined image into the flow
        if (articleImageSrc) {
            htmlContent += `
                <div class="article-image-wrapper">
                    <img src="${articleImageSrc}" alt="Article Highlight">
                </div>
            `;
        }

        // Helper function for Bold Markdown parsing
        const parseBold = (str) => {
            return str.replace(/\*(.*?)\*/g, '<strong style="color:var(--primary-color)">$1</strong>');
        };

        // Generate Paragraph HTML
        paragraphs.forEach(p => {
            htmlContent += `<p>${parseBold(p)}</p>`;
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
    articleInput.value = "येथे आपला लेख किंवा मुलाखत पेस्ट करा...\n\nही एक प्रात्यक्षिक ओळ आहे. मल्लविद्या चळवळीचा प्रसार करण्यासाठी हा एक चांगला उपक्रम आहे.\n\nतुम्ही २००० शब्दांपर्यंत इथे मोठे लेख टाकू शकता. शब्द वाढले की कॉलमची संख्या आणि अक्षरांचा आकार आपोआप योग्य रितीने ऍडजस्ट होतो!";
    
    // Initial Render
    updatePreview();
    updateAuthorPreview();

    // ---------------------------------
    // 6. HD Canvas Download Export (PNG)
    // ---------------------------------
    downloadBtn.addEventListener('click', () => {
        const originalText = downloadBtn.innerText;
        downloadBtn.innerText = "Exporting PNG...";
        downloadBtn.disabled = true;

        html2canvas(canvasElement, {
            scale: 4, 
            useCORS: true, 
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: canvasElement.scrollWidth,
            windowHeight: canvasElement.scrollHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `kusti-mallavidya-${Date.now()}.png`;
            link.href = imgData;
            link.click();
            downloadBtn.innerText = originalText;
            downloadBtn.disabled = false;
        }).catch(err => {
            console.error(err);
            alert('चित्र तयार करताना काहीतरी चूक झाली.');
            downloadBtn.innerText = originalText;
            downloadBtn.disabled = false;
        });
    });

    // ---------------------------------
    // 7. PDF Download Export
    // ---------------------------------
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    downloadPdfBtn.addEventListener('click', () => {
        const originalText = downloadPdfBtn.innerText;
        downloadPdfBtn.innerText = "Exporting PDF...";
        downloadPdfBtn.disabled = true;

        html2canvas(canvasElement, {
            scale: 3, // slightly lower to keep reasonable PDF size
            useCORS: true, 
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: canvasElement.scrollWidth,
            windowHeight: canvasElement.scrollHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            // jsPDF logic for 3:4 orientation. e.g. 210mm x 280mm
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [210, 280]
            });
            
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 280);
            pdf.save(`kusti-mallavidya-${Date.now()}.pdf`);
            
            downloadPdfBtn.innerText = originalText;
            downloadPdfBtn.disabled = false;
        }).catch(err => {
            console.error('PDF Export Error:', err);
            alert('PDF तयार करताना काहीतरी चूक झाली.');
            downloadPdfBtn.innerText = originalText;
            downloadPdfBtn.disabled = false;
        });
    });
});

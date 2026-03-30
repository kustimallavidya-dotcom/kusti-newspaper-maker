// PWA Registration, Install Logic & Splash Screen
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) installBtn.style.display = 'block';
});

window.addEventListener('appinstalled', () => {
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) installBtn.style.display = 'none';
    deferredPrompt = null;
    console.log('PWA was installed');
});

window.addEventListener('load', () => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registered successfully!', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    }

    // Handle Install Button Click
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    }

    // Splash Screen Dismissal
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 600); // Wait for transition
        }
    }, 2000); // 2 Seconds display
});

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------
    // 1. Core Elements
    // ---------------------------------
    const articleInput = document.getElementById('article-input');
    const articleContentContainer = document.getElementById('article-content');
    const wordCountSpan = document.getElementById('word-count');
    
    const manualDateInput = document.getElementById('manual-date');
    const currentDateDisplay = document.getElementById('current-date-text');
    const establishmentDisplay = document.getElementById('establishment-display');

    const newspaperTitleInput = document.getElementById('newspaper-title-input');
    const newspaperSloganInput = document.getElementById('newspaper-slogan-input');
    const newspaperTitleDisplay = document.getElementById('newspaper-title-display');
    const newspaperSloganDisplay = document.getElementById('newspaper-slogan-display');
    const headlineDisplay = document.getElementById('article-headline-display');
    const headerElement = document.querySelector('.newspaper-header');

    // Branding & Author
    const logoUpload = document.getElementById('logo-upload');
    const logoPreview = document.getElementById('logo-preview');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    const authorNameInput = document.getElementById('author-name');
    const authorRoleInput = document.getElementById('author-role');
    const authorImageUpload = document.getElementById('author-image-upload');
    const authorByline = document.getElementById('author-byline');
    const authorNameDisplay = document.getElementById('author-name-display');
    const authorRoleDisplay = document.getElementById('author-role-display');
    const authorPhotoPreview = document.getElementById('author-photo-preview');
    
    // Additional Media
    const imageUpload = document.getElementById('article-image-upload');
    const downloadBtn = document.getElementById('download-btn');
    const canvasElement = document.getElementById('newspaper-canvas');

    // Drawer Elements (Mobile)
    const drawerToggle = document.getElementById('drawer-toggle');
    const drawerClose = document.getElementById('drawer-close');
    const dashboard = document.querySelector('.dashboard');

    if (drawerToggle && drawerClose && dashboard) {
        drawerToggle.addEventListener('click', () => {
            dashboard.classList.add('drawer-open');
        });
        drawerClose.addEventListener('click', () => {
            dashboard.classList.remove('drawer-open');
        });
    }

    // ---------------------------------
    // 2. Granular Color Pickers
    // ---------------------------------
    const titleColorPicker = document.getElementById('title-color-picker');
    const sloganColorPicker = document.getElementById('slogan-color-picker');
    const dateColorPicker = document.getElementById('date-color-picker');
    const headlineColorPicker = document.getElementById('headline-color-picker');
    const articleColorPicker = document.getElementById('article-color-picker');
    const headerLinePicker = document.getElementById('header-line-color');
    const authorBgColorPicker = document.getElementById('author-bg-color');
    const authorNameColorPicker = document.getElementById('author-name-color');
    const authorRoleColorPicker = document.getElementById('author-role-color');

    const loadColors = () => {
        const colors = JSON.parse(localStorage.getItem('kusti-colors') || '{}');
        if (colors.title) titleColorPicker.value = colors.title;
        if (colors.slogan) sloganColorPicker.value = colors.slogan;
        if (colors.date) dateColorPicker.value = colors.date;
        if (colors.headline) headlineColorPicker.value = colors.headline;
        if (colors.article) articleColorPicker.value = colors.article;
        if (colors.headerLine) headerLinePicker.value = colors.headerLine;
        if (colors.authorBg) authorBgColorPicker.value = colors.authorBg;
        if (colors.authorName) authorNameColorPicker.value = colors.authorName;
        if (colors.authorRole) authorRoleColorPicker.value = colors.authorRole;
        applyAllColors();
    };

    const saveColors = () => {
        const colors = {
            title: titleColorPicker.value,
            slogan: sloganColorPicker.value,
            date: dateColorPicker.value,
            headline: headlineColorPicker.value,
            article: articleColorPicker.value,
            headerLine: headerLinePicker.value,
            authorBg: authorBgColorPicker.value,
            authorName: authorNameColorPicker.value,
            authorRole: authorRoleColorPicker.value
        };
        localStorage.setItem('kusti-colors', JSON.stringify(colors));
        applyAllColors();
    };



    [titleColorPicker, sloganColorPicker, dateColorPicker, headlineColorPicker, articleColorPicker, headerLinePicker, authorBgColorPicker, authorNameColorPicker, authorRoleColorPicker].forEach(p => {
        p.addEventListener('input', saveColors);
    });

    // ---------------------------------
    // 3. Text Formatting Tools
    // ---------------------------------

    const parseFormatting = (str) => {
        return str
            .replace(/\*(.*?)\*/g, '<strong style="font-weight:bold;">$1</strong>');
    };

    // ---------------------------------
    // 4. Preview & Layout Logic (Multi-Page)
    // ---------------------------------
    let articleImageSrc = null;
    let authorImageSrc = localStorage.getItem('kusti-author-photo') || null;

    const updatePreview = () => {
        const text = articleInput.value.trim();
        const words = text ? text.split(/\s+/).filter(w => w.length > 0) : [];
        wordCountSpan.innerText = `शब्द: ${words.length}`;
        
        const pagesContainer = document.getElementById('pages-container');
        const template = document.getElementById('newspaper-canvas-template');
        
        // Clear existing pages except template
        const pages = pagesContainer.querySelectorAll('.newspaper-page:not(#newspaper-canvas-template .newspaper-page)');
        pages.forEach(p => p.remove());

        if (words.length === 0) return;

        const WORDS_PER_PAGE = 300;
        const totalPagesCount = Math.ceil(words.length / WORDS_PER_PAGE);

        for (let i = 0; i < totalPagesCount; i++) {
            const pageClone = template.querySelector('.newspaper-page').cloneNode(true);
            pagesContainer.appendChild(pageClone);

            // Fill Header Info
            pageClone.querySelector('.page-date-text').innerText = manualDateInput.value || 'येथे दिनांक दिसेल';
            pageClone.querySelector('.page-est-text').innerText = 'स्थापना २००९';
            pageClone.querySelector('.page-edition-text').innerText = document.getElementById('edition-input').value;
            
            const logoPreviewEl = pageClone.querySelector('.page-logo-preview');
            const logoPlaceholderEl = pageClone.querySelector('.page-logo-placeholder');
            const cachedLogo = localStorage.getItem('kusti-logo');
            if (cachedLogo) {
                logoPreviewEl.src = cachedLogo;
                logoPreviewEl.style.display = 'block';
                logoPlaceholderEl.style.display = 'none';
            }

            pageClone.querySelector('.page-title-display').innerText = newspaperTitleInput.value.trim() || "कुस्ती मल्लविद्या";
            pageClone.querySelector('.page-slogan-display').innerText = newspaperSloganInput.value.trim() || '"गे मायभु तुझे मी फेडीन पांग सारे..."';

            // Author Byline (Only on Page 1)
            const authorBylineEl = pageClone.querySelector('.page-author-byline');
            if (i === 0 && (authorNameInput.value || authorRoleInput.value || authorImageSrc)) {
                authorBylineEl.style.display = 'flex';
                if (authorImageSrc) pageClone.querySelector('.page-author-photo').src = authorImageSrc;
                pageClone.querySelector('.page-author-name').innerText = authorNameInput.value ? 'लेखक: ' + authorNameInput.value : '';
                pageClone.querySelector('.page-author-role').innerText = authorRoleInput.value;
            } else {
                authorBylineEl.style.display = 'none';
            }

            // Headline (Only on Page 1)
            const headlineEl = pageClone.querySelector('.page-headline-display');
            if (i === 0 && headlineInput.value.trim()) {
                headlineEl.innerText = headlineInput.value.trim();
                headlineEl.style.display = 'block';
            } else {
                headlineEl.style.display = 'none';
            }

            // Content Splitting
            const startIdx = i * WORDS_PER_PAGE;
            const endIdx = Math.min(startIdx + WORDS_PER_PAGE, words.length);
            const pageWords = words.slice(startIdx, endIdx);
            
            let htmlContent = '';
            // Image (Only on Page 1)
            if (i === 0 && articleImageSrc) {
                htmlContent += `<div class="article-image-wrapper" style="width:100%; margin-bottom:15px;"><img src="${articleImageSrc}" style="width:100%; border:2px solid #222;"></div>`;
            }

            // Join words and wrap in paragraph
            const joinedText = pageWords.join(' ');
            htmlContent += `<p style="font-size:18px; line-height:1.6; text-align:justify;">${parseFormatting(joinedText)}</p>`;
            pageClone.querySelector('.page-article-content').innerHTML = htmlContent;

            // Status (Continued / Samapt)
            const statusEl = pageClone.querySelector('.page-status');
            if (i < totalPagesCount - 1) {
                statusEl.innerText = 'पुढील पानावर क्रमशः...';
            } else {
                statusEl.innerText = 'समाप्त.';
            }

            // Page Number
            pageClone.querySelector('.page-number-display').innerText = `पान ${i + 1}`;
        }

        applyAllColors();
    };

    const applyAllColors = () => {
        const pages = document.querySelectorAll('.newspaper-page');
        pages.forEach(page => {
            page.querySelector('.page-title-display').style.color = titleColorPicker.value;
            page.querySelector('.page-slogan-display').style.color = sloganColorPicker.value;
            page.querySelector('.page-date-text').style.color = dateColorPicker.value;
            page.querySelector('.page-est-text').style.color = dateColorPicker.value;
            
            const headline = page.querySelector('.page-headline-display');
            if (headline) headline.style.color = headlineColorPicker.value;
            
            page.querySelector('.page-article-content').style.color = articleColorPicker.value;
            page.querySelector('.newspaper-header').style.borderBottomColor = headerLinePicker.value;
            
            const authorByline = page.querySelector('.page-author-byline');
            if (authorByline) {
                authorByline.style.backgroundColor = authorBgColorPicker.value;
                authorByline.querySelector('.page-author-name').style.color = authorNameColorPicker.value;
                authorByline.querySelector('.page-author-role').style.color = authorRoleColorPicker.value;
            }
            
            page.querySelector('.newspaper-footer').style.borderTopColor = headerLinePicker.value;
        });
        document.documentElement.style.setProperty('--primary-color', headerLinePicker.value);
    };

    [titleColorPicker, sloganColorPicker, dateColorPicker, headlineColorPicker, articleColorPicker, headerLinePicker, authorBgColorPicker, authorNameColorPicker, authorRoleColorPicker].forEach(p => {
        p.addEventListener('input', saveColors);
    });

    // ---------------------------------
    // 5. Shared Events
    // ---------------------------------
    manualDateInput.addEventListener('input', (e) => {
        localStorage.setItem('kusti-date', e.target.value);
        updatePreview();
    });

    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                localStorage.setItem('kusti-logo', event.target.result);
                updatePreview();
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
                updatePreview();
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

    articleInput.addEventListener('input', updatePreview);
    headlineInput.addEventListener('input', updatePreview);
    
    const editionInput = document.getElementById('edition-input');
    editionInput.addEventListener('input', () => {
        localStorage.setItem('kusti-edition', editionInput.value.trim());
        updatePreview();
    });

    authorNameInput.addEventListener('input', () => {
        localStorage.setItem('kusti-author-name', authorNameInput.value.trim());
        updatePreview();
    });
    authorRoleInput.addEventListener('input', () => {
        localStorage.setItem('kusti-author-role', authorRoleInput.value.trim());
        updatePreview();
    });

    newspaperTitleInput.addEventListener('input', () => {
        const val = newspaperTitleInput.value.trim();
        localStorage.setItem('kusti-newspaper-title', val);
        updatePreview();
    });
    newspaperSloganInput.addEventListener('input', () => {
        const val = newspaperSloganInput.value.trim();
        localStorage.setItem('kusti-newspaper-slogan', val);
        updatePreview();
    });

    // ---------------------------------
    // 7. Initial State & Restore
    // ---------------------------------
    articleInput.value = "येथे आपला लेख किंवा मुलाखत पेस्ट करा...";
    
    // Restore Cached Data
    authorNameInput.value = localStorage.getItem('kusti-author-name') || '';
    authorRoleInput.value = localStorage.getItem('kusti-author-role') || '';
    
    const cachedTitle = localStorage.getItem('kusti-newspaper-title');
    if (cachedTitle) newspaperTitleInput.value = cachedTitle;

    const cachedSlogan = localStorage.getItem('kusti-newspaper-slogan');
    if (cachedSlogan) newspaperSloganInput.value = cachedSlogan;

    manualDateInput.value = localStorage.getItem('kusti-date') || '';
    editionInput.value = localStorage.getItem('kusti-edition') || '';

    loadColors();
    updatePreview();

    // ---------------------------------
    // 8. Export Logic
    // ---------------------------------
    const downloadAllPNG = async () => {
        downloadBtn.disabled = true;
        const pages = document.querySelectorAll('.newspaper-page:not(#newspaper-canvas-template .newspaper-page)');
        for (let i = 0; i < pages.length; i++) {
            const canvas = await html2canvas(pages[i], { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
            const link = document.createElement('a');
            link.download = `kusti-page-${i + 1}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            // Small delay to prevent browser blocking multiple downloads
            await new Promise(r => setTimeout(r, 600));
        }
        downloadBtn.disabled = false;
    };

    const downloadPDF = async () => {
        const btn = document.getElementById('download-pdf-btn');
        btn.disabled = true;
        const pages = document.querySelectorAll('.newspaper-page:not(#newspaper-canvas-template .newspaper-page)');
        
        // A4 dimension in mm is 210x297. Our canvas is 1080x1440 (3:4 ratio).
        // 210mm width -> 280mm height maintains 3:4 ratio.
        const pdf = new jspdf.jsPDF('p', 'mm', [210, 280]);

        for (let i = 0; i < pages.length; i++) {
            const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            if (i > 0) pdf.addPage([210, 280], 'p');
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 280);
        }
        pdf.save(`kusti-newspaper-${Date.now()}.pdf`);
        btn.disabled = false;
    };

    downloadBtn.addEventListener('click', downloadAllPNG);
    document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);
});

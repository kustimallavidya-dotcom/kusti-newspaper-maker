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

    const applyAllColors = () => {
        newspaperTitleDisplay.style.color = titleColorPicker.value;
        newspaperSloganDisplay.style.color = sloganColorPicker.value;
        currentDateDisplay.style.color = dateColorPicker.value;
        establishmentDisplay.style.color = dateColorPicker.value;
        headlineDisplay.style.color = headlineColorPicker.value;
        articleContentContainer.style.color = articleColorPicker.value;
        headerElement.style.borderBottomColor = headerLinePicker.value;
        establishmentDisplay.style.borderTopColor = headerLinePicker.value;
        authorByline.style.backgroundColor = authorBgColorPicker.value;
        authorNameDisplay.style.color = authorNameColorPicker.value;
        authorRoleDisplay.style.color = authorRoleColorPicker.value;
        // Update general primary for author border
        document.documentElement.style.setProperty('--primary-color', headerLinePicker.value);
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
    // 4. Preview & Layout Logic
    // ---------------------------------
    let articleImageSrc = null;
    let authorImageSrc = localStorage.getItem('kusti-author-photo') || null;

    const updatePreview = () => {
        const text = articleInput.value.trim();
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        
        const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
        wordCountSpan.innerText = `शब्द: ${words}`;
        
        // Effective space weight calculation (words + penalties for media/structure)
        let effectiveWords = words;
        if (articleImageSrc) effectiveWords += 500; // Image space penalty
        effectiveWords += paragraphs.length * 25; // Paragraph margin penalty (increased to fill space)
        effectiveWords += 150; // Drop-cap penalty

        const headlineInputEl = document.getElementById('headline-input');
        const headlineInput = headlineInputEl ? headlineInputEl.value.trim() : '';

        if (headlineInput) {
            headlineDisplay.innerText = headlineInput;
            headlineDisplay.style.display = 'block';
        } else {
            headlineDisplay.style.display = 'none';
        }

        let htmlContent = '';
        if (articleImageSrc) {
            htmlContent += `<div class="article-image-wrapper"><img src="${articleImageSrc}"></div>`;
        }

        paragraphs.forEach(p => {
            htmlContent += `<p>${parseFormatting(p)}</p>`;
        });

        articleContentContainer.innerHTML = htmlContent;

        // 1. Initial colCount guess based on word density (large limits)
        let colCount = 5;
        if (effectiveWords <= 150) colCount = 1;
        else if (effectiveWords <= 400) colCount = 2;
        else if (effectiveWords <= 800) colCount = 3;
        else if (effectiveWords <= 1500) colCount = 4;

        // 2. Binary search Font logic with live scrollWidth
        const findOptimalFont = (count) => {
            articleContentContainer.style.setProperty('--dynamic-col-count', count);
            let minF = 4, maxF = 120, bestF = 4; // allow massive sizes to prevent empty gaps
            
            for (let i = 0; i < 25; i++) {
                let mid = (minF + maxF) / 2;
                articleContentContainer.style.setProperty('--dynamic-font-size', mid + "px");
                const h = articleContentContainer.offsetHeight; // Force reflow
                
                // If it spills into a new un-viewable column horizontally
                if (articleContentContainer.scrollWidth > articleContentContainer.clientWidth + 5) {
                    maxF = mid;
                } else {
                    bestF = mid;
                    minF = mid;
                }
            }
            return bestF;
        };

        let finalF = findOptimalFont(colCount);
        
        // Final polish to avoid clipping the very bottom or right side
        // Subtract a bit more to ensure it breathes and doesn't cut off words
        articleContentContainer.style.setProperty('--dynamic-font-size', (finalF - 0.7) + "px");

        applyAllColors();
    };

    const updateAuthorPreview = () => {
        const name = authorNameInput.value.trim();
        const role = authorRoleInput.value.trim();
        localStorage.setItem('kusti-author-name', name);
        localStorage.setItem('kusti-author-role', role);

        if (name || role || authorImageSrc) {
            authorByline.style.display = 'flex';
            if (authorImageSrc) authorPhotoPreview.src = authorImageSrc;
            authorPhotoPreview.style.display = authorImageSrc ? 'block' : 'none';
            authorNameDisplay.innerText = name ? 'लेखक: ' + name : '';
            authorRoleDisplay.innerText = role;
        } else {
            authorByline.style.display = 'none';
        }
    };

    // ---------------------------------
    // 5. Shared Events
    // ---------------------------------
    manualDateInput.addEventListener('input', (e) => {
        currentDateDisplay.innerText = e.target.value || 'येथे दिनांक दिसेल';
        localStorage.setItem('kusti-date', e.target.value);
    });

    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                logoPreview.src = event.target.result;
                logoPreview.style.display = 'block';
                logoPlaceholder.style.display = 'none';
                localStorage.setItem('kusti-logo', event.target.result);
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

    articleInput.addEventListener('input', updatePreview);
    document.getElementById('headline-input').addEventListener('input', updatePreview);
    const editionInput = document.getElementById('edition-input');
    const editionDisplay = document.getElementById('edition-display');

    editionInput.addEventListener('input', () => {
        editionDisplay.innerText = editionInput.value.trim();
        localStorage.setItem('kusti-edition', editionInput.value.trim());
    });

    authorNameInput.addEventListener('input', updateAuthorPreview);
    authorRoleInput.addEventListener('input', updateAuthorPreview);
    newspaperTitleInput.addEventListener('input', () => {
        newspaperTitleDisplay.innerText = newspaperTitleInput.value.trim() || "कुस्ती मल्लविद्या";
    });
    newspaperSloganInput.addEventListener('input', () => {
        newspaperSloganDisplay.innerText = newspaperSloganInput.value.trim() || '"गे मायभु तुझे मी फेडीन पांग सारे..."';
    });

    // ---------------------------------
    // 7. Initial State
    // ---------------------------------
    articleInput.value = "येथे आपला लेख किंवा मुलाखत पेस्ट करा...\n\nही एक प्रात्यक्षिक ओळ आहे. मल्लविद्या चळवळीचा प्रसार करण्यासाठी हा एक चांगला उपक्रम आहे.\n\nतुम्ही २००० शब्दांपर्यंत इथे मोठे लेख टाकू शकता. शब्द वाढले की कॉलमची संख्या आणि अक्षरांचा आकार आपोआप योग्य रितीने ऍडजस्ट होतो!";
    
    // Restore Cached Data
    const cachedLogo = localStorage.getItem('kusti-logo');
    if (cachedLogo) {
        logoPreview.src = cachedLogo;
        logoPreview.style.display = 'block';
        logoPlaceholder.style.display = 'none';
    }
    authorNameInput.value = localStorage.getItem('kusti-author-name') || '';
    authorRoleInput.value = localStorage.getItem('kusti-author-role') || '';
    manualDateInput.value = localStorage.getItem('kusti-date') || '';
    currentDateDisplay.innerText = manualDateInput.value || 'येथे दिनांक दिसेल';
    editionInput.value = localStorage.getItem('kusti-edition') || '';
    editionDisplay.innerText = editionInput.value;

    loadColors();
    updatePreview();
    updateAuthorPreview();

    // Setup temporary export style to prevent mobile scaling overlaps
    const prepareExport = () => {
        canvasElement.style.setProperty('transform', 'scale(1)', 'important');
        canvasElement.style.setProperty('transform-origin', 'top left', 'important');
        canvasElement.style.setProperty('margin', '0', 'important');
    };
    const restoreExport = () => {
        canvasElement.style.removeProperty('transform');
        canvasElement.style.removeProperty('transform-origin');
        canvasElement.style.removeProperty('margin');
    };

    // Export PNG
    downloadBtn.addEventListener('click', () => {
        downloadBtn.disabled = true;
        prepareExport();
        setTimeout(() => {
            html2canvas(canvasElement, { scale: 4, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
                const link = document.createElement('a');
                link.download = `kusti-mallavidya-${Date.now()}.png`;
                link.href = canvas.toDataURL();
                link.click();
                restoreExport();
                downloadBtn.disabled = false;
            }).catch(err => {
                console.error(err);
                restoreExport();
                downloadBtn.disabled = false;
            });
        }, 300); // Allow browser to reflow the 1:1 scale before snapshot
    });

    // Export PDF
    document.getElementById('download-pdf-btn').addEventListener('click', () => {
        const btn = document.getElementById('download-pdf-btn');
        btn.disabled = true;
        prepareExport();
        setTimeout(() => {
            html2canvas(canvasElement, { scale: 3, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const pdfWidth = 210;
                const pdfHeight = (canvas.height / canvas.width) * pdfWidth;
                const pdf = new jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfWidth, pdfHeight] });
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`kusti-mallavidya-${Date.now()}.pdf`);
                restoreExport();
                btn.disabled = false;
            }).catch(err => {
                console.error(err);
                restoreExport();
                btn.disabled = false;
            });
        }, 300);
    });
});

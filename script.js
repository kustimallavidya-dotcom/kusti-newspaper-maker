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

    // ---------------------------------
    // 2. Granular Color Pickers
    // ---------------------------------
    const titleColorPicker = document.getElementById('title-color-picker');
    const sloganColorPicker = document.getElementById('slogan-color-picker');
    const dateColorPicker = document.getElementById('date-color-picker');
    const headlineColorPicker = document.getElementById('headline-color-picker');
    const articleColorPicker = document.getElementById('article-color-picker');
    const headerLinePicker = document.getElementById('header-line-color');

    const loadColors = () => {
        const colors = JSON.parse(localStorage.getItem('kusti-colors') || '{}');
        if (colors.title) titleColorPicker.value = colors.title;
        if (colors.slogan) sloganColorPicker.value = colors.slogan;
        if (colors.date) dateColorPicker.value = colors.date;
        if (colors.headline) headlineColorPicker.value = colors.headline;
        if (colors.article) articleColorPicker.value = colors.article;
        if (colors.headerLine) headerLinePicker.value = colors.headerLine;
        applyAllColors();
    };

    const saveColors = () => {
        const colors = {
            title: titleColorPicker.value,
            slogan: sloganColorPicker.value,
            date: dateColorPicker.value,
            headline: headlineColorPicker.value,
            article: articleColorPicker.value,
            headerLine: headerLinePicker.value
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
        // Update general primary for author border
        document.documentElement.style.setProperty('--primary-color', headerLinePicker.value);
    };

    [titleColorPicker, sloganColorPicker, dateColorPicker, headlineColorPicker, articleColorPicker, headerLinePicker].forEach(p => {
        p.addEventListener('input', saveColors);
    });

    // ---------------------------------
    // 3. Text Formatting Tools
    // ---------------------------------
    window.applyFormatting = (type) => {
        const start = articleInput.selectionStart;
        const end = articleInput.selectionEnd;
        const text = articleInput.value;
        const selectedText = text.substring(start, end);
        if (!selectedText) return;

        let formatted = '';
        if (type === 'bold') formatted = `*${selectedText}*`;
        if (type === 'italic') formatted = `_${selectedText}_`;
        if (type === 'underline') formatted = `#${selectedText}#`;

        articleInput.value = text.substring(0, start) + formatted + text.substring(end);
        updatePreview();
    };

    const parseFormatting = (str) => {
        return str
            .replace(/\*(.*?)\*/g, '<strong style="font-weight:bold;">$1</strong>')
            .replace(/_(.*?)_/g, '<em style="font-style:italic;">$1</em>')
            .replace(/#(.*?)#/g, '<span style="text-decoration:underline;">$1</span>');
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
        
        let effectiveWords = words;
        if (articleImageSrc) effectiveWords += 400;

        const headlineInputEl = document.getElementById('headline-input');
        const headlineInput = headlineInputEl ? headlineInputEl.value.trim() : '';

        if (headlineInput) {
            headlineDisplay.innerText = headlineInput;
            headlineDisplay.style.display = 'block';
        } else {
            headlineDisplay.style.display = 'none';
        }

        let colCount = 2, minF = 21, maxF = 32;
        if (effectiveWords <= 350) { colCount = 2; minF = 20; maxF = 36; }
        else if (effectiveWords <= 700) { colCount = 3; minF = 16; maxF = 28; }
        else if (effectiveWords <= 1200) { colCount = 4; minF = 13; maxF = 22; }
        else if (effectiveWords <= 1700) { colCount = 5; minF = 11; maxF = 18; }
        else { colCount = 6; minF = 9; maxF = 15; }

        let htmlContent = '';
        if (articleImageSrc) {
            htmlContent += `<div class="article-image-wrapper"><img src="${articleImageSrc}"></div>`;
        }

        paragraphs.forEach(p => {
            htmlContent += `<p>${parseFormatting(p)}</p>`;
        });

        articleContentContainer.style.setProperty('--dynamic-col-count', colCount);
        articleContentContainer.innerHTML = htmlContent;

        // Binary search for optimal font size
        let bestF = minF;
        articleContentContainer.style.height = '100%';
        for (let i = 0; i < 12; i++) {
            let mid = (minF + maxF) / 2;
            articleContentContainer.style.setProperty('--dynamic-font-size', mid + "px");
            if (articleContentContainer.scrollWidth > articleContentContainer.clientWidth + 5) {
                maxF = mid;
            } else {
                bestF = mid;
                minF = mid;
            }
        }
        articleContentContainer.style.setProperty('--dynamic-font-size', bestF + "px");
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
    authorNameInput.addEventListener('input', updateAuthorPreview);
    authorRoleInput.addEventListener('input', updateAuthorPreview);
    newspaperTitleInput.addEventListener('input', () => {
        newspaperTitleDisplay.innerText = newspaperTitleInput.value.trim() || "कुस्ती मल्लविद्या";
    });
    newspaperSloganInput.addEventListener('input', () => {
        newspaperSloganDisplay.innerText = newspaperSloganInput.value.trim() || '"गे मायभु तुझे मी फेडीन पांग सारे..."';
    });

    // ---------------------------------
    // 6. AI Assistant (Pollinations Stable)
    // ---------------------------------
    window.toggleAIModal = function() {
        const modal = document.getElementById('ai-modal');
        const overlay = document.getElementById('ai-overlay');
        const isOpen = modal.style.display !== 'none';
        modal.style.display = isOpen ? 'none' : 'block';
        overlay.style.display = isOpen ? 'none' : 'block';
    };

    window.switchAITab = (tab) => {
        document.getElementById('tool-title').style.display = tab === 'title' ? 'block' : 'none';
        document.getElementById('tool-image').style.display = tab === 'image' ? 'block' : 'none';
    };

    window.generateTitleCalligraphy = async function() {
        const titleName = document.getElementById('title-name-input').value.trim();
        const style = document.getElementById('title-style-input').value.trim();
        if (!titleName) return alert('नाव लिहा!');

        document.getElementById('title-calligraphy-btn').style.display = 'none';
        document.getElementById('title-calligraphy-loading').style.display = 'block';

        // Pollinations.ai is free and always works for general illustrations
        const prompt = `Indian newspaper masthead design, ${style}, white background, horizontal banner, high resolution art style`;
        const encoded = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=320&nologo=true&seed=${Math.floor(Math.random()*1e9)}`;

        const img = document.getElementById('title-calligraphy-preview');
        img.crossOrigin = "anonymous";
        img.onload = () => {
            document.getElementById('title-calligraphy-loading').style.display = 'none';
            document.getElementById('title-calligraphy-result').style.display = 'block';
            document.getElementById('title-calligraphy-btn').style.display = 'block';
        };
        img.onerror = () => {
            alert('Image generation error. Try again.');
            document.getElementById('title-calligraphy-loading').style.display = 'none';
            document.getElementById('title-calligraphy-btn').style.display = 'block';
        };
        img.src = url;
    };

    window.applyTitleImage = () => {
        const previewImg = document.getElementById('title-calligraphy-preview');
        const titleImageDisplay = document.getElementById('title-image-display');
        const titleTextDisplay = document.getElementById('newspaper-title-display');
        titleImageDisplay.src = previewImg.src;
        titleImageDisplay.style.display = 'block';
        titleTextDisplay.style.display = 'none';
        window.toggleAIModal();
    };

    window.generateAIImage = async () => {
        const prompt = document.getElementById('image-ai-prompt').value.trim();
        if (!prompt) return alert('वर्णन लिहा!');

        document.getElementById('image-gen-btn').style.display = 'none';
        document.getElementById('image-loading').style.display = 'block';

        const encoded = encodeURIComponent(prompt + ', high quality newspaper photo style');
        const url = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random()*1e9)}`;

        const img = document.getElementById('ai-generated-image');
        img.crossOrigin = "anonymous";
        img.onload = () => {
            document.getElementById('image-loading').style.display = 'none';
            document.getElementById('image-result').style.display = 'block';
            document.getElementById('image-gen-btn').style.display = 'block';
        };
        img.src = url;
    };

    window.insertAIImage = () => {
        articleImageSrc = document.getElementById('ai-generated-image').src;
        updatePreview();
        window.toggleAIModal();
    };

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

    loadColors();
    updatePreview();
    updateAuthorPreview();

    // Export PNG
    downloadBtn.addEventListener('click', () => {
        downloadBtn.disabled = true;
        html2canvas(canvasElement, { scale: 4, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
            const link = document.createElement('a');
            link.download = `kusti-mallavidya-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            downloadBtn.disabled = false;
        });
    });

    // Export PDF
    document.getElementById('download-pdf-btn').addEventListener('click', () => {
        const btn = document.getElementById('download-pdf-btn');
        btn.disabled = true;
        html2canvas(canvasElement, { scale: 3, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: [210, 280] });
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 280);
            pdf.save(`kusti-mallavidya-${Date.now()}.pdf`);
            btn.disabled = false;
        });
    });
});

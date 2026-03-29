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
    const currentDateDisplay = document.getElementById('top-right-date'); // Fix: updated ID
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
        
        let effectiveWords = words;
        if (articleImageSrc) {
            effectiveWords += 400; // An image roughly takes up 400-words equivalent of vertical space
        }

        // Headline handling
        const headlineInputEl = document.getElementById('headline-input');
        const headlineInput = headlineInputEl ? headlineInputEl.value.trim() : '';

        const headlineDisplay = document.getElementById('article-headline-display');
        if (headlineInput) {
            headlineDisplay.innerText = headlineInput;
            headlineDisplay.style.display = 'block';
        } else {
            headlineDisplay.style.display = 'none';
        }

        // Define base aesthetic configurations based on word boundaries
        let colCount = 2;
        let lineHeight = "1.8";
        let pMargin = "0.7em";
        let colGap = "45px";
        let minF = 21;
        let maxF = 32;

        if (effectiveWords <= 350) {
            colCount = 2; lineHeight = "1.75"; pMargin = "0.75em"; colGap = "45px";
            minF = 18; maxF = 28;
        } else if (effectiveWords <= 700) {
            colCount = 3; lineHeight = "1.6"; pMargin = "0.65em"; colGap = "40px";
            minF = 15; maxF = 22;
        } else if (effectiveWords <= 1200) {
            colCount = 4; lineHeight = "1.45"; pMargin = "0.55em"; colGap = "35px";
            minF = 12; maxF = 17;
        } else if (effectiveWords <= 1700) {
            colCount = 5; lineHeight = "1.35"; pMargin = "0.45em"; colGap = "30px";
            minF = 10; maxF = 14;
        } else {
            colCount = 6; lineHeight = "1.25"; pMargin = "0.3em"; colGap = "20px";
            minF = 8; maxF = 12;
        }

        // Initially render HTML Content inside the container to test fit
        let htmlContent = '';

        if (articleImageSrc) {
            htmlContent += `
                <div class="article-image-wrapper">
                    <img src="${articleImageSrc}" alt="Article Highlight">
                </div>
            `;
        }

        const parseBold = (str) => {
            return str.replace(/\*(.*?)\*/g, '<strong style="color:var(--primary-color)">$1</strong>');
        };

        paragraphs.forEach(p => {
            htmlContent += `<p>${parseBold(p)}</p>`;
        });

        // Set layout variables
        articleContentContainer.style.setProperty('--dynamic-col-count', colCount);
        articleContentContainer.style.setProperty('--dynamic-line-height', lineHeight);
        articleContentContainer.style.setProperty('--dynamic-margin-bottom', pMargin);
        articleContentContainer.style.setProperty('--dynamic-col-gap', colGap);
        
        articleContentContainer.innerHTML = htmlContent;

        // --- Aggressive Auto-Fill Binary Search ---
        // Dynamically find the absolute perfect font size so text reaches bottom without overflowing.
        let bestF = minF;
        
        // Temporarily ensure columns are constrained inside 100% height
        articleContentContainer.style.height = '100%';

        for (let i = 0; i < 15; i++) {
            let mid = (minF + maxF) / 2;
            articleContentContainer.style.setProperty('--dynamic-font-size', mid + "px");
            
            // Check overflow. If scrollWidth > clientWidth, text pushed into hidden horizontal columns
            // Meaning it overflowed vertically and got wrapped sideways.
            if (articleContentContainer.scrollWidth > articleContentContainer.clientWidth + 5) {
                maxF = mid; // Too big
            } else {
                bestF = mid; // Fits, try making it even bigger
                minF = mid;
            }
        }
        
        // Apply optimized font size but slightly lower to guarantee safe padding
        articleContentContainer.style.setProperty('--dynamic-font-size', (bestF - 0.2) + "px");
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
    
    const headlineInputEl = document.getElementById('headline-input');
    if (headlineInputEl) {
        headlineInputEl.addEventListener('input', updatePreview);
    }
    
    authorNameInput.addEventListener('input', updateAuthorPreview);
    authorRoleInput.addEventListener('input', updateAuthorPreview);

    // Initial default placeholder state
    articleInput.value = "येथे आपला लेख किंवा मुलाखत पेस्ट करा...\n\nही एक प्रात्यक्षिक ओळ आहे. मल्लविद्या चळवळीचा प्रसार करण्यासाठी हा एक चांगला उपक्रम आहे.\n\nतुम्ही २००० शब्दांपर्यंत इथे मोठे लेख टाकू शकता. शब्द वाढले की कॉलमची संख्या आणि अक्षरांचा आकार आपोआप योग्य रितीने ऍडजस्ट होतो!";
    
    const newspaperTitleInput = document.getElementById('newspaper-title-input');
    const newspaperSloganInput = document.getElementById('newspaper-slogan-input');
    const newspaperTitleDisplay = document.getElementById('newspaper-title-display');
    const newspaperSloganDisplay = document.getElementById('newspaper-slogan-display');

    const updateNewspaperTitle = () => {
        newspaperTitleDisplay.innerText = newspaperTitleInput.value.trim() || "कुस्ती मल्लविद्या";
    };

    const updateNewspaperSlogan = () => {
        newspaperSloganDisplay.innerText = newspaperSloganInput.value.trim() || '"गे मायभु तुझे मी फेडीन पांग सारे..."';
    };

    newspaperTitleInput.addEventListener('input', updateNewspaperTitle);
    newspaperSloganInput.addEventListener('input', updateNewspaperSlogan);

    // Initializations
    updatePreview();
    updateAuthorPreview();
    updateNewspaperTitle();
    updateNewspaperSlogan();

    // ---------------------------------
    // 6. Gemini AI Assistant (New Feature)
    // ---------------------------------
    window.toggleAIModal = function() {
        const modal = document.getElementById('ai-modal');
        const overlay = document.getElementById('ai-overlay');
        const apiKeyInput = document.getElementById('gemini-api-key');
        
        // Auto-restore saved key
        if (localStorage.getItem('gemini-api-key') && apiKeyInput && !apiKeyInput.value) {
            apiKeyInput.value = localStorage.getItem('gemini-api-key');
        }

        const isOpen = modal.style.display !== 'none';
        modal.style.display = isOpen ? 'none' : 'block';
        overlay.style.display = isOpen ? 'none' : 'block';
    };

    window.switchAITab = function(tab) {
        document.getElementById('tool-title').style.display = tab === 'title' ? 'block' : 'none';
        document.getElementById('tool-image').style.display = tab === 'image' ? 'block' : 'none';

        const tabTitle = document.getElementById('tab-title');
        const tabImage = document.getElementById('tab-image');

        if (tab === 'title') {
            tabTitle.style.color = 'var(--primary-color)';
            tabTitle.style.background = '#f9f9f9';
            tabTitle.style.borderBottom = '3px solid var(--primary-color)';
            tabImage.style.color = '#888';
            tabImage.style.background = 'white';
            tabImage.style.borderBottom = '3px solid transparent';
        } else {
            tabImage.style.color = '#1a237e';
            tabImage.style.background = '#f0f4ff';
            tabImage.style.borderBottom = '3px solid #1a237e';
            tabTitle.style.color = '#888';
            tabTitle.style.background = 'white';
            tabTitle.style.borderBottom = '3px solid transparent';
        }
    };

    window.generateTitle = async function() {
        const apiKey = document.getElementById('gemini-api-key').value.trim();
        const prompt = document.getElementById('title-ai-prompt').value.trim();
        const btn = document.getElementById('title-gen-btn');

        if (!apiKey) return alert('Gemini API Key भरा!');
        if (!prompt) return alert('तुम्हाला कसले नाव हवे ते लिहा!');

        localStorage.setItem('gemini-api-key', apiKey);
        btn.innerText = '⏳ तयार होत आहे...';
        btn.disabled = true;
        document.getElementById('title-result').style.display = 'none';

        try {
            const instruction = `Output ONLY a single short attractive Marathi newspaper name (maximum 4 words). Just the name itself, nothing else. No punctuation, no quotes, no explanation.`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `${instruction}\n\nUser request: ${prompt}` }] }] })
            });

            const data = await response.json();
            if (data.error) {
                alert('Error: ' + data.error.message);
            } else {
                const result = data.candidates[0].content.parts[0].text.trim();
                document.getElementById('title-result-text').innerText = result;
                document.getElementById('title-result').style.display = 'block';
            }
        } catch (err) {
            alert('Network Error: ' + err.message);
        } finally {
            btn.innerText = '✨ नाव सुचवा';
            btn.disabled = false;
        }
    };

    window.applyTitle = function() {
        const newTitle = document.getElementById('title-result-text').innerText.trim();
        if (newTitle) {
            const titleInput = document.getElementById('newspaper-title-input');
            titleInput.value = newTitle;
            updateNewspaperTitle();
            window.toggleAIModal();
        }
    };

    window.generateAIImage = function() {
        const prompt = document.getElementById('image-ai-prompt').value.trim();
        if (!prompt) return alert('फोटोचे वर्णन English मध्ये लिहा!');

        document.getElementById('image-gen-btn').style.display = 'none';
        document.getElementById('image-loading').style.display = 'block';
        document.getElementById('image-result').style.display = 'none';

        // Use Pollinations.ai (Free, no API key needed)
        const encoded = encodeURIComponent(prompt + ', high quality, newspaper photo style, realistic');
        const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=600&nologo=true&seed=${Date.now()}`;

        const img = document.getElementById('ai-generated-image');
        img.onload = function() {
            document.getElementById('image-loading').style.display = 'none';
            document.getElementById('image-result').style.display = 'block';
            document.getElementById('image-gen-btn').style.display = 'block';
        };
        img.onerror = function() {
            document.getElementById('image-loading').style.display = 'none';
            document.getElementById('image-gen-btn').style.display = 'block';
            alert('फोटो बनवण्यात अडचण आली. पुन्हा प्रयत्न करा.');
        };
        img.src = imageUrl;
    };

    window.insertAIImage = function() {
        const img = document.getElementById('ai-generated-image');
        if (img.src) {
            // Fetch image as base64 so it works with html2canvas
            fetch(img.src)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        articleImageSrc = e.target.result;
                        updatePreview();
                        window.toggleAIModal();
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(() => {
                    // Fallback: use src directly
                    articleImageSrc = img.src;
                    updatePreview();
                    window.toggleAIModal();
                });
        }
    };

    // Legacy function kept for compatibility
    window.generateAIContent = window.generateTitle;

    // ---------------------------------
    // 7. HD Canvas Download Export (PNG)
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

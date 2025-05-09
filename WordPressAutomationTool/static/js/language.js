document.addEventListener('DOMContentLoaded', async () => {
    const languageItems = document.querySelectorAll('[data-lang]');
    const dropdownButton = document.getElementById('languageDropdown');
    const elementsToTranslate = document.querySelectorAll('[data-translatable]');
  
    // Function to translate page content
    async function translatePage(lang) {
      try {
        for (const element of elementsToTranslate) {
          const originalText = element.getAttribute('data-original') || element.textContent.trim();
  
          // Store original text if not already stored
          if (!element.getAttribute('data-original')) {
            element.setAttribute('data-original', originalText);
          }
  
          const response = await fetch('/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: originalText, target: lang })
          });
  
          const data = await response.json();
          if (data.translatedText) {
            element.textContent = data.translatedText;
          }
        }
      } catch (error) {
        console.error('Translation error:', error);
      }
    }
  
    // Event listener for language selection
    languageItems.forEach(item => {
      item.addEventListener('click', async (e) => {
        e.preventDefault();
        const lang = item.getAttribute('data-lang');
        localStorage.setItem('preferred_language', lang);
  
        if (dropdownButton) {
          dropdownButton.innerHTML = `<i class="fas fa-globe me-1"></i> ${item.textContent}`;
        }
  
        await translatePage(lang);
      });
    });
  
    // Initialize language on page load
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang) {
      const selectedLang = document.querySelector(`[data-lang="${savedLang}"]`);
      if (selectedLang && dropdownButton) {
        dropdownButton.innerHTML = `<i class="fas fa-globe me-1"></i> ${selectedLang.textContent}`;
      }
      await translatePage(savedLang);
    }
  });
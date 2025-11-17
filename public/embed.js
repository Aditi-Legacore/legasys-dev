// Embeddable Form Script
// Usage: Include this script on your website and configure via window.FormEmbedConfig

(function() {
  // Default configuration
  const defaultConfig = {
    formId: null, // Required: The ID of the form to embed
    buttonText: 'Contact Us',
    buttonColor: '#007bff',
    buttonPosition: 'bottom-right', // Options: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    buttonSize: 'medium', // Options: 'small', 'medium', 'large'
    modalWidth: '90%', // Modal width (e.g., '90%', '600px')
    modalHeight: '80%', // Modal height (e.g., '80%', '500px')
    domain: window.location.origin // The domain where the form is hosted (defaults to current origin)
  };

  // Merge user config with defaults
  const config = { ...defaultConfig, ...(window.FormEmbedConfig || {}) };

  if (!config.formId) {
    console.error('FormEmbed: formId is required in window.FormEmbedConfig');
    return;
  }

  // Create styles
  const styles = `
    .form-embed-button {
      position: fixed;
      z-index: 9999;
      border: none;
      border-radius: 50%;
      color: white;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .form-embed-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 12px rgba(0,0,0,0.3);
    }
    .form-embed-button.${config.buttonPosition} {
      ${config.buttonPosition === 'bottom-right' ? 'bottom: 20px; right: 20px;' : ''}
      ${config.buttonPosition === 'bottom-left' ? 'bottom: 20px; left: 20px;' : ''}
      ${config.buttonPosition === 'top-right' ? 'top: 20px; right: 20px;' : ''}
      ${config.buttonPosition === 'top-left' ? 'top: 20px; left: 20px;' : ''}
    }
    .form-embed-button.small { width: 50px; height: 50px; font-size: 12px; }
    .form-embed-button.medium { width: 60px; height: 60px; font-size: 14px; }
    .form-embed-button.large { width: 70px; height: 70px; font-size: 16px; }

    .form-embed-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: none;
      justify-content: center;
      align-items: center;
    }
    .form-embed-modal.show { display: flex; }
    .form-embed-modal-content {
      background: white;
      border-radius: 8px;
      width: ${config.modalWidth};
      height: ${config.modalHeight};
      position: relative;
      overflow: hidden;
    }
    .form-embed-close {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #f0f0f0;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 18px;
      z-index: 10001;
    }
    .form-embed-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create floating button
  const button = document.createElement('button');
  button.className = `form-embed-button ${config.buttonPosition} ${config.buttonSize}`;
  button.style.backgroundColor = config.buttonColor;
  button.textContent = config.buttonText;
  document.body.appendChild(button);

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'form-embed-modal';
  modal.innerHTML = `
    <div class="form-embed-modal-content">
      <button class="form-embed-close">&times;</button>
      <iframe class="form-embed-iframe" src="${config.domain}/embed/form?id=${config.formId}"></iframe>
    </div>
  `;
  document.body.appendChild(modal);

  // Event listeners
  button.addEventListener('click', () => {
    modal.classList.add('show');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('form-embed-close')) {
      modal.classList.remove('show');
    }
  });

  // Listen for messages from iframe (e.g., form submission success or close modal)
  window.addEventListener('message', (event) => {
    if (event.origin !== config.domain) return;
    if (event.data === 'formSubmitted' || event.data === 'closeModal') {
      modal.classList.remove('show');
      // Optional: Show a success message or redirect
    }
  });
})();

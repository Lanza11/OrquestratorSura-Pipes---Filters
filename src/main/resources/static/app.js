// ========================================
// Utility Functions
// ========================================

/**
 * Realiza una petición POST a la API
 */
async function post(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Realiza una petición GET a la API
 */
async function get(url) {
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Muestra el resultado en formato JSON con colores
 */
function displayResult(outputId, data, isError = false) {
  const resultContainer = document.getElementById(outputId).closest('.result-container');
  const outputElement = document.getElementById(outputId);
  
  resultContainer.classList.remove('hidden');
  
  if (isError) {
    outputElement.classList.add('error');
    outputElement.classList.remove('success');
    outputElement.textContent = `❌ Error:\n\n${data}`;
  } else {
    outputElement.classList.add('success');
    outputElement.classList.remove('error');
    outputElement.textContent = JSON.stringify(data, null, 2);
  }
  
  // Scroll suave al resultado
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Muestra estado de carga en un botón
 */
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="btn-icon">⏳</span> Cargando...';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText;
  }
}

/**
 * Valida email básico
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ========================================
// Tab Management
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Remover active de todos
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Activar el seleccionado
      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
});

// ========================================
// Preview Form Handler
// ========================================

document.getElementById("previewForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Validaciones
  const email = form.clientEmail.value;
  if (!isValidEmail(email)) {
    displayResult("previewOut", "El formato del email no es válido", true);
    return;
  }
  
  const payload = {
    ruleCode: form.ruleCode.value.trim(),
    client: { 
      id: form.clientId.value.trim(), 
      name: form.clientName.value.trim(), 
      email: email.trim() 
    },
    variables: { 
      amount: form.amount.value.trim() 
    }
  };
  
  setButtonLoading(submitButton, true);
  
  try {
    const data = await post("/notifications/preview", payload);
    displayResult("previewOut", data, false);
  } catch (error) {
    displayResult("previewOut", error.message, true);
  } finally {
    setButtonLoading(submitButton, false);
  }
});

// ========================================
// Send Form Handler
// ========================================

document.getElementById("sendForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Validaciones
  const email = form.clientEmail.value;
  if (!isValidEmail(email)) {
    displayResult("sendOut", "El formato del email no es válido", true);
    return;
  }
  
  // Confirmación antes de enviar
  const confirmed = confirm(
    `¿Estás seguro de enviar la notificación a ${email}?\n\n` +
    `⚠️ Esta acción enviará un email real a través de Mailhog.`
  );
  
  if (!confirmed) {
    return;
  }
  
  const payload = {
    ruleCode: form.ruleCode.value.trim(),
    client: { 
      id: form.clientId.value.trim(), 
      name: form.clientName.value.trim(), 
      email: email.trim() 
    },
    variables: { 
      amount: form.amount.value.trim() 
    }
  };
  
  setButtonLoading(submitButton, true);
  
  try {
    const data = await post("/notifications/send", payload);
    displayResult("sendOut", data, false);
    
    // Sugerencia para ver el log
    if (data.id) {
      setTimeout(() => {
        const viewLog = confirm(
          `✅ Notificación enviada exitosamente!\n\n` +
          `ID: ${data.id}\n\n` +
          `¿Deseas consultar el log de esta notificación?`
        );
        
        if (viewLog) {
          // Cambiar a la pestaña de logs
          document.querySelector('[data-tab="logs"]').click();
          // Llenar el campo con el ID
          document.getElementById('logId').value = data.id;
          // Auto-submit después de un pequeño delay
          setTimeout(() => {
            document.getElementById('logForm').requestSubmit();
          }, 300);
        }
      }, 500);
    }
  } catch (error) {
    displayResult("sendOut", error.message, true);
  } finally {
    setButtonLoading(submitButton, false);
  }
});

// ========================================
// Log Form Handler
// ========================================

document.getElementById("logForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const logId = form.logId.value.trim();
  
  // Validación básica del ID
  if (logId.length < 10) {
    displayResult("logOut", "El ID del log parece ser inválido. Debe tener al menos 10 caracteres.", true);
    return;
  }
  
  setButtonLoading(submitButton, true);
  
  try {
    const data = await get(`/notifications/${logId}`);
    displayResult("logOut", data, false);
  } catch (error) {
    displayResult("logOut", error.message, true);
  } finally {
    setButtonLoading(submitButton, false);
  }
});

// ========================================
// Health Check on Load
// ========================================

async function checkHealth() {
  try {
    const response = await fetch('/ping');
    if (response.ok) {
      const statusBadge = document.getElementById('statusBadge');
      statusBadge.innerHTML = '<span class="status-dot"></span> Sistema Activo';
      statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
    }
  } catch (error) {
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.innerHTML = '<span class="status-dot" style="background: #EF4444;"></span> Sistema Inactivo';
    statusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
    console.error('Health check failed:', error);
  }
}

// Ejecutar health check al cargar la página
document.addEventListener('DOMContentLoaded', checkHealth);

// ========================================
// Keyboard Shortcuts
// ========================================

document.addEventListener('keydown', (e) => {
  // Alt + 1: Preview tab
  if (e.altKey && e.key === '1') {
    e.preventDefault();
    document.querySelector('[data-tab="preview"]').click();
  }
  // Alt + 2: Send tab
  if (e.altKey && e.key === '2') {
    e.preventDefault();
    document.querySelector('[data-tab="send"]').click();
  }
  // Alt + 3: Logs tab
  if (e.altKey && e.key === '3') {
    e.preventDefault();
    document.querySelector('[data-tab="logs"]').click();
  }
});

// ========================================
// Console Welcome Message
// ========================================

console.log('%c📬 MS Notificaciones', 'font-size: 20px; font-weight: bold; color: #4F46E5;');
console.log('%cArquitectura Hexagonal con Pipes & Filters', 'font-size: 12px; color: #6B7280;');
console.log('%cAtajos de teclado:', 'font-weight: bold; margin-top: 10px;');
console.log('  Alt + 1: Preview');
console.log('  Alt + 2: Enviar');
console.log('  Alt + 3: Logs');


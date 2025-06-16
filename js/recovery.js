// Configuración de recuperación de contraseña con gestor de BD
let isProcessing = false;
let currentStep = 1;
let verifiedUser = null;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeRecoveryPage();
});

// Inicializar página de recuperación
async function initializeRecoveryPage() {
    // Esperar a que se inicialice la base de datos
    await waitForDatabaseManager();
    
    // Configurar componentes
    animatePageEntry();
    setupRecoveryForm();
    setupPasswordForm();
    setupFormValidation();
    setupAnimations();
    setupInteractiveElements();
}

// Esperar a que el gestor de BD esté disponible
async function waitForDatabaseManager() {
    let attempts = 0;
    while (!window.dbManager && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.dbManager) {
        console.error('Database manager no disponible');
        showNotification('Error al conectar con la base de datos', 'error');
    }
}

// Animación de entrada de página
function animatePageEntry() {
    const card = document.querySelector('.recovery-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.95)';
        
        setTimeout(() => {
            card.style.animation = 'fadeIn 0.8s ease-out forwards';
        }, 100);
    }
    
    // Animar elementos del formulario
    const formElements = document.querySelectorAll('.form-group, .form-header');
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.animation = 'slideInUp 0.6s ease-out forwards';
        }, 200 + (index * 100));
    });
}

// Configurar animaciones interactivas
function setupAnimations() {
    // Animaciones hover para campos
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1), 0 8px 25px rgba(37, 99, 235, 0.15)';
            
            // Efecto glow en el label
            const label = this.parentNode.querySelector('label');
            if (label) {
                label.style.color = 'var(--primary-blue)';
                label.style.transform = 'translateY(-2px)';
                label.style.fontWeight = '700';
            }
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
            
            const label = this.parentNode.querySelector('label');
            if (label) {
                label.style.color = 'var(--neutral-700)';
                label.style.transform = 'translateY(0)';
                label.style.fontWeight = '600';
            }
        });
        
        // Animación de escritura
        input.addEventListener('input', function() {
            if (this.value) {
                this.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(59, 130, 246, 0.02))';
                this.style.borderColor = 'var(--primary-blue-light)';
            } else {
                this.style.background = 'white';
                this.style.borderColor = 'var(--neutral-200)';
            }
        });
    });
    
    // Animaciones para botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.boxShadow = '0 15px 35px rgba(37, 99, 235, 0.3)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        // Efecto ripple
        button.addEventListener('click', createRippleEffect);
    });
}

// Crear efecto ripple
function createRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.8s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 800);
}

// Configurar elementos interactivos
function setupInteractiveElements() {
    // Efecto de typing en el título
    const title = document.querySelector('.card-header h1');
    if (title) {
        const text = title.textContent;
        title.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                title.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 80);
            }
        };
        
        setTimeout(typeWriter, 500);
    }
}

// Configurar validación en tiempo real
function setupFormValidation() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearMessages();
            validateFieldWithAnimation(this);
        });
        
        input.addEventListener('blur', function() {
            validateFieldWithAnimation(this);
        });
    });
}

// Validar campo con animaciones
function validateFieldWithAnimation(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Validaciones específicas
    switch(field.name || field.id) {
        case 'numeroId':
            if (value && !/^\d{8,12}$/.test(value)) {
                isValid = false;
                errorMessage = 'El número debe tener entre 8 y 12 dígitos';
            }
            break;
            
        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Ingrese un email válido';
            }
            break;
            
        case 'newPassword':
            if (value && value.length < 6) {
                isValid = false;
                errorMessage = 'La contraseña debe tener al menos 6 caracteres';
            }
            break;
    }
    
    // Aplicar estilos visuales
    if (value) {
        if (isValid) {
            showFieldSuccess(field);
        } else {
            showFieldError(field, errorMessage);
        }
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

// Mostrar éxito en campo
function showFieldSuccess(field) {
    clearFieldError(field);
    
    field.style.borderColor = 'var(--success-green)';
    field.style.background = 'rgba(16, 185, 129, 0.05)';
    
    // Icono de éxito
    const successIcon = document.createElement('div');
    successIcon.className = 'field-icon success-icon';
    successIcon.innerHTML = '✓';
    successIcon.style.cssText = `
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%) scale(0);
        color: var(--success-green);
        font-weight: bold;
        animation: bounceIn 0.5s ease-out forwards;
    `;
    
    field.parentNode.style.position = 'relative';
    field.parentNode.appendChild(successIcon);
}

// Mostrar error en campo
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = 'var(--error-red)';
    field.style.background = 'rgba(239, 68, 68, 0.05)';
    field.style.animation = 'shake 0.5s ease-out';
    
    // Mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
        color: var(--error-red);
        font-size: 0.875rem;
        margin-top: 6px;
        opacity: 0;
        transform: translateY(-10px);
        animation: slideInUp 0.3s ease-out forwards;
    `;
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    
    setTimeout(() => {
        field.style.animation = '';
    }, 500);
}

// Limpiar error de campo
function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    const icons = field.parentNode.querySelectorAll('.field-icon');
    
    if (errorDiv) errorDiv.remove();
    icons.forEach(icon => icon.remove());
    
    field.style.borderColor = 'var(--neutral-200)';
    field.style.background = 'white';
}

// Configurar formulario de recuperación
function setupRecoveryForm() {
    const form = document.getElementById('recoveryForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (isProcessing) return;

        // Obtener datos del formulario
        const tipoId = document.getElementById('tipoId').value;
        const numeroId = document.getElementById('numeroId').value;
        const email = document.getElementById('email').value;

        // Limpiar mensajes anteriores
        clearMessages();

        // Validar campos con el validador existente
        if (!validateRecoveryFields(tipoId, numeroId, email)) {
            return;
        }

        isProcessing = true;
        
        try {
            // Mostrar estado de carga
            const submitButton = this.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, true, 'Verificando datos...');
            
            // Simular tiempo de procesamiento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verificar usuario usando la función existente
            const user = await verifyUserForRecovery(tipoId, numeroId, email);
            
            if (!user) {
                showVerificationError();
                return;
            }
            
            // Guardar usuario verificado para el siguiente paso
            verifiedUser = user;
            
            // Mostrar éxito y continuar al siguiente paso
            await showVerificationSuccess();
            showPasswordForm();
            
        } catch (error) {
            console.error('Error en verificación:', error);
            showMessage('error', 'Error al verificar los datos. Por favor intente nuevamente.');
        } finally {
            isProcessing = false;
            const submitButton = form.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, false);
        }
    });
}

// Validar campos de recuperación
function validateRecoveryFields(tipoId, numeroId, email) {
    let isValid = true;
    clearMessages();
    
    if (!tipoId) {
        animateFieldError(document.getElementById('tipoId'), 'Seleccione el tipo de identificación');
        isValid = false;
    }
    
    if (!numeroId) {
        animateFieldError(document.getElementById('numeroId'), 'Ingrese el número de identificación');
        isValid = false;
    } else if (!/^\d{8,12}$/.test(numeroId)) {
        animateFieldError(document.getElementById('numeroId'), 'El número debe tener entre 8 y 12 dígitos');
        isValid = false;
    }
    
    if (!email) {
        animateFieldError(document.getElementById('email'), 'Ingrese el email');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        animateFieldError(document.getElementById('email'), 'Ingrese un email válido');
        isValid = false;
    }
    
    if (!isValid) {
        showMessage('error', '⚠ Por favor complete todos los campos correctamente');
    }
    
    return isValid;
}

// Animar error en campo
function animateFieldError(field, message) {
    field.style.borderColor = 'var(--error-red)';
    field.style.background = 'rgba(239, 68, 68, 0.05)';
    field.style.animation = 'shake 0.5s ease-out';
    
    const tooltip = document.createElement('div');
    tooltip.className = 'error-tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        bottom: -30px;
        left: 0;
        background: var(--error-red);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.75rem;
        white-space: nowrap;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-10px);
        animation: slideInUp 0.3s ease-out forwards;
    `;
    
    field.parentNode.style.position = 'relative';
    field.parentNode.appendChild(tooltip);
    
    setTimeout(() => {
        tooltip.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => tooltip.remove(), 300);
        field.style.borderColor = 'var(--neutral-200)';
        field.style.background = 'white';
        field.style.animation = '';
    }, 3000);
}

// Verificar usuario para recuperación usando el gestor de BD
async function verifyUserForRecovery(tipoId, numeroId, email) {
    try {
        if (!window.dbManager) {
            throw new Error('Gestor de base de datos no disponible');
        }
        
        // Buscar usuario por credenciales
        const user = await dbManager.getUserByCredentials(tipoId, numeroId);
        
        // Verificar que el email coincida
        if (user && user.email.toLowerCase() === email.toLowerCase()) {
            console.log('Usuario verificado para recuperación:', user.nombres, user.apellidos);
            return user;
        }
        
        return null;
        
    } catch (error) {
        console.error('Error en verificación de usuario:', error);
        throw error;
    }
}

// Mostrar éxito en verificación
async function showVerificationSuccess() {
    showMessage('success', '✓ Datos verificados correctamente. Ahora puede establecer su nueva contraseña.');
    
    // Animación de éxito en el formulario
    const form = document.getElementById('recoveryForm');
    form.style.animation = 'pulse 0.5s ease-out';
    
    await new Promise(resolve => setTimeout(resolve, 1000));
}

// Mostrar error en verificación
function showVerificationError() {
    const card = document.querySelector('.recovery-card');
    card.style.animation = 'shake 0.6s ease-out';
    
    showMessage('error', '⚠ Los datos ingresados no coinciden con nuestros registros. Verifique la información e intente nuevamente.');
    
    // Limpiar campos sensibles
    document.getElementById('email').value = '';
    document.getElementById('email').focus();
    
    setTimeout(() => {
        card.style.animation = '';
    }, 600);
}

// Mostrar formulario de nueva contraseña
function showPasswordForm() {
    const recoveryForm = document.getElementById('recoveryForm');
    const passwordForm = document.getElementById('passwordForm');
    const subtitle = document.getElementById('subtitle');
    
    // Actualizar progreso (SOLO el indicador de pasos)
    
    // Animación de transición
    recoveryForm.style.animation = 'slideOutLeft 0.5s ease-out';
    
    setTimeout(() => {
        recoveryForm.style.display = 'none';
        passwordForm.style.display = 'block';
        passwordForm.style.animation = 'slideInRight 0.5s ease-out';
        
        if (subtitle) {
            subtitle.textContent = 'Ingrese su nueva contraseña';
            subtitle.style.animation = 'fadeIn 0.5s ease-out';
        }
        
        // Focus en el campo de contraseña
        const passwordField = document.getElementById('newPassword');
        if (passwordField) {
            setTimeout(() => passwordField.focus(), 500);
        }
    }, 500);
}

// Configurar formulario de nueva contraseña
function setupPasswordForm() {
    const form = document.getElementById('passwordForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isProcessing) return;
        
        const newPassword = document.getElementById('newPassword').value;
        
        // Validar contraseña
        if (!validateNewPassword(newPassword)) {
            return;
        }
        
        isProcessing = true;
        
        try {
            // Mostrar estado de carga
            const submitButton = form.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, true, 'Actualizando contraseña...');
            
            // Simular tiempo de procesamiento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Actualizar contraseña usando el gestor de BD
            await updateUserPassword(verifiedUser.id, newPassword);
            
            // Mostrar éxito y redirigir
            await showPasswordUpdateSuccess();
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
            
        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            showMessage('error', 'Error al actualizar la contraseña. Por favor intente nuevamente.');
        } finally {
            isProcessing = false;
            const submitButton = form.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, false);
        }
    });
}

// Validar nueva contraseña
function validateNewPassword(password) {
    clearMessages();
    
    if (!password) {
        animateFieldError(document.getElementById('newPassword'), 'Ingrese la nueva contraseña');
        showMessage('error', '⚠ La contraseña es requerida');
        return false;
    }
    
    if (password.length < 6) {
        animateFieldError(document.getElementById('newPassword'), 'La contraseña debe tener al menos 6 caracteres');
        showMessage('error', '⚠ La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    return true;
}

// Actualizar contraseña del usuario usando el gestor de BD
async function updateUserPassword(userId, newPassword) {
    try {
        if (!window.dbManager) {
            throw new Error('Gestor de base de datos no disponible');
        }
        
        // Hashear la nueva contraseña
        const hashedPassword = await hashPassword(newPassword);
        
        // Buscar y actualizar el usuario en localStorage
        const db = JSON.parse(localStorage.getItem('db') || '{"users":[]}');
        const userIndex = db.users.findIndex(u => u.id === userId || u.numeroCuenta === userId);
        
        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }
        
        // Actualizar contraseña
        db.users[userIndex].password = hashedPassword;
        db.users[userIndex].ultimoAcceso = new Date().toISOString();
        
        // Guardar en localStorage
        localStorage.setItem('db', JSON.stringify(db));
        
        console.log('Contraseña actualizada exitosamente para usuario:', userId);
        return true;
        
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        throw error;
    }
}

// Función para hashear contraseña (agregar si no existe)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Mostrar éxito en actualización de contraseña
async function showPasswordUpdateSuccess() {
    const form = document.querySelector('.form');
    
    // Ocultar formulario
    form.style.animation = 'fadeOut 0.5s ease-out';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mostrar mensaje de éxito SIN la barra de carga
    form.innerHTML = `
        <div class="success-container" style="text-align: center; padding: 40px 0;">
            <div class="success-icon" style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                color: white;
                font-size: 2.5rem;
                font-weight: bold;
                animation: bounceIn 1s ease-out;
            ">✓</div>
            
            <h2 style="
                color: var(--success-green);
                margin-bottom: 16px;
                font-size: 1.5rem;
                animation: slideInUp 0.6s ease-out 0.3s both;
            ">¡Contraseña Actualizada!</h2>
            
            <p style="
                color: var(--neutral-600);
                margin-bottom: 24px;
                animation: slideInUp 0.6s ease-out 0.5s both;
            ">Su contraseña ha sido actualizada exitosamente.<br>Redirigiendo al inicio de sesión...</p>
        </div>
    `;
    
    form.style.animation = 'fadeIn 0.5s ease-out';
    
    showMessage('success', 'Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...');
}

// Configurar estado de loading en botones
function setButtonLoading(button, isLoading, text = 'Procesando...') {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <span class="loading-spinner"></span>
            ${text}
        `;
        button.style.opacity = '0.8';
        button.style.cursor = 'not-allowed';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || 'Continuar';
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Mostrar mensajes con animaciones
function showMessage(type, message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    clearMessages();
    
    if (type === 'error') {
        errorDiv.innerHTML = message;
        errorDiv.style.display = 'block';
        errorDiv.style.animation = 'slideInUp 0.5s ease-out, shake 0.5s ease-out 0.5s';
        
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        successDiv.innerHTML = message;
        successDiv.style.display = 'block';
        successDiv.style.animation = 'slideInUp 0.5s ease-out';
        
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Mostrar notificación flotante
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 1000;
        animation: slideInRight 0.5s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Limpiar mensajes
function clearMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    
    const tooltips = document.querySelectorAll('.error-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

// Agregar estilos CSS adicionales
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes bounceIn {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes loadingProgress {
        0% { width: 0%; }
        100% { width: 100%; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
    
    @keyframes expandWidth {
        from { width: 0; }
        to { width: 60px; }
    }
    
    @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
    }
    
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-icon {
        font-size: 1.25rem;
        font-weight: bold;
    }
`;

document.head.appendChild(additionalStyles);

// Función para volver al login
function goToLogin() {
    const card = document.querySelector('.recovery-card');
    card.style.animation = 'fadeOut 0.5s ease-out';
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

// Exponer función globalmente
window.goToLogin = goToLogin;

// Al final del archivo, agrega esto para eliminar cualquier barra residual:

document.addEventListener('DOMContentLoaded', function() {
    // Eliminar cualquier barra de progreso existente
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-bar-container, .progress-indicator, [class*="progress"]');
        progressBars.forEach(bar => {
            if (bar && bar.parentNode) {
                bar.remove();
            }
        });
    }, 100);
});

// Finalizado
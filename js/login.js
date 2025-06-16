// Configuración de login con gestor de BD
let isLoggingIn = false;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

// Inicializar página de login
async function initializeLoginPage() {
    // Esperar a que se inicialice la base de datos
    await waitForDatabaseManager();
    
    // Verificar sesión existente
    checkExistingSession();
    
    // Configurar componentes
    animatePageEntry();
    setupLoginForm();
    setupFormValidation();
    setupInteractiveElements();
    setupAnimations();
    setupParticleEffect();
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

// Verificar sesión existente
function checkExistingSession() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showNotification('Sesión activa detectada. Redirigiendo...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
}

// Animación de entrada de página
function animatePageEntry() {
    const card = document.querySelector('.login-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.9)';
        
        setTimeout(() => {
            card.style.animation = 'fadeIn 1s ease-out forwards';
        }, 100);
    }
    
    // Animar elementos del formulario
    const formElements = document.querySelectorAll('.form-group, .links');
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.animation = 'slideInUp 0.6s ease-out forwards';
        }, 300 + (index * 100));
    });
}

// Configurar efecto de partículas en el fondo
function setupParticleEffect() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    // Crear partículas flotantes
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s infinite linear;
            pointer-events: none;
        `;
        container.appendChild(particle);
    }
    
    // Agregar estilos de animación para partículas
    if (!document.getElementById('particleStyles')) {
        const particleStyles = document.createElement('style');
        particleStyles.id = 'particleStyles';
        particleStyles.textContent = `
            @keyframes float {
                0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(particleStyles);
    }
}

// Configurar animaciones interactivas
function setupAnimations() {
    // Animaciones hover para campos
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'translateY(-3px)';
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
        
        // Efecto de escritura
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
    });
    
    // Animaciones para enlaces
    const links = document.querySelectorAll('.link');
    links.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.background = 'rgba(37, 99, 235, 0.1)';
            this.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.background = 'transparent';
            this.style.boxShadow = 'none';
        });
    });
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
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 500);
    }
    
    // Efecto ripple para botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
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

// Configurar formulario de login
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isLoggingIn) return;
        
        // Obtener datos del formulario
        const tipoId = document.getElementById('tipoId').value;
        const numeroId = document.getElementById('numeroId').value;
        const password = document.getElementById('password').value;
        
        // Validar campos con animaciones
        if (!validateLoginFields(tipoId, numeroId, password)) {
            return;
        }
        
        isLoggingIn = true;
        
        try {
            // Mostrar estado de carga con animaciones
            showLoadingState(true);
            
            // Simular tiempo de procesamiento
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Autenticar usuario usando el gestor de BD
            const user = await authenticateUser(tipoId, numeroId, password);
            
            if (user) {
                // Login exitoso con animación
                await showSuccessAnimation();
                
                // Guardar sesión
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirigir
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                // Credenciales incorrectas
                showLoginError();
            }
            
        } catch (error) {
            console.error('Error en el login:', error);
            showMessage('error', 'Error al iniciar sesión. Por favor intente nuevamente.');
        } finally {
            isLoggingIn = false;
            showLoadingState(false);
        }
    });
}

// Validar campos de login con animaciones
function validateLoginFields(tipoId, numeroId, password) {
    let isValid = true;
    
    // Limpiar mensajes anteriores
    clearMessages();
    
    // Validar tipo de identificación
    if (!tipoId) {
        animateFieldError(document.getElementById('tipoId'), 'Seleccione el tipo de identificación');
        isValid = false;
    }
    
    // Validar número de identificación
    if (!numeroId) {
        animateFieldError(document.getElementById('numeroId'), 'Ingrese el número de identificación');
        isValid = false;
    } else if (!/^\d{8,12}$/.test(numeroId)) {
        animateFieldError(document.getElementById('numeroId'), 'El número debe tener entre 8 y 12 dígitos');
        isValid = false;
    }
    
    // Validar contraseña
    if (!password) {
        animateFieldError(document.getElementById('password'), 'Ingrese la contraseña');
        isValid = false;
    } else if (password.length < 6) {
        animateFieldError(document.getElementById('password'), 'La contraseña debe tener al menos 6 caracteres');
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
    
    // Crear tooltip de error
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
    
    // Remover tooltip después de 3 segundos
    setTimeout(() => {
        tooltip.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => tooltip.remove(), 300);
        field.style.borderColor = 'var(--neutral-200)';
        field.style.background = 'white';
        field.style.animation = '';
    }, 3000);
}

// Configurar validación en tiempo real
function setupFormValidation() {
    const inputs = document.querySelectorAll('#loginForm input, #loginForm select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearMessages();
            validateLoginField(this);
        });
        
        input.addEventListener('blur', function() {
            validateLoginField(this);
        });
    });
}

// Validar campo individual
function validateLoginField(field) {
    const value = field.value.trim();
    
    // Remover tooltips existentes
    const existingTooltip = field.parentNode.querySelector('.error-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    let isValid = true;
    
    switch(field.id) {
        case 'numeroId':
            if (value && !/^\d{8,12}$/.test(value)) {
                isValid = false;
            }
            break;
            
        case 'password':
            if (value && value.length < 6) {
                isValid = false;
            }
            break;
    }
    
    // Aplicar estilos visuales
    if (value) {
        if (isValid) {
            field.style.borderColor = 'var(--success-green)';
            field.style.background = 'rgba(16, 185, 129, 0.05)';
        } else {
            field.style.borderColor = 'var(--error-red)';
            field.style.background = 'rgba(239, 68, 68, 0.05)';
        }
    } else {
        field.style.borderColor = 'var(--neutral-200)';
        field.style.background = 'white';
    }
    
    return isValid;
}

// Autenticar usuario usando el gestor de BD
async function authenticateUser(tipoId, numeroId, password) {
    // Solo busca el usuario por tipo y número
    const user = await window.dbManager.getUserByCredentials(tipoId, numeroId);
    if (!user) return null;

    // Hashea la contraseña ingresada
    const hashedInput = await hashPassword(password);

    // Compara el hash con el almacenado
    if (user.password === hashedInput) {
        return user;
    }
    return null;
}

// Mostrar estado de carga
function showLoadingState(isLoading) {
    const submitButton = document.querySelector('#loginForm button[type="submit"]');
    const form = document.getElementById('loginForm');
    if (!submitButton) return;

    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <span class="loading-spinner"></span>
            Iniciando sesión...
        `;
        submitButton.style.opacity = '0.8';

        // Deshabilitar campos
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.disabled = true;
            input.style.opacity = '0.7';
        });

        // Efecto de pulso en la tarjeta
        const card = document.querySelector('.login-card');
        card.style.animation = 'pulse 2s ease-in-out infinite';

        // NO CAMBIES LA OPACIDAD DEL FORMULARIO COMPLETO
        // form.style.opacity = '0.7'; // <-- Elimina o comenta esta línea si existe
    } else {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Iniciar Sesión';
        submitButton.style.opacity = '1';

        // Habilitar campos
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '1';
        });

        // Remover efecto de pulso
        const card = document.querySelector('.login-card');
        card.style.animation = '';
        // form.style.opacity = '1'; // <-- Elimina o comenta esta línea si existe
    }
}

// Crear barra de progreso
function createProgressBar() {
    const form = document.querySelector('.form');
    if (!form) return null;

    // Verifica si ya existe una barra de progreso
    if (form.querySelector('.progress-bar-container')) {
        return form.querySelector('.progress-bar-container').firstChild;
    }

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-bar-container';
    progressContainer.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(37, 99, 235, 0.1);
        border-radius: 2px;
        margin-bottom: 24px;
        overflow: hidden;
    `;

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        height: 100%;
        width: 0%;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        border-radius: 2px;
        transition: all 0.3s ease;
    `;

    progressContainer.appendChild(progressBar);
    form.insertBefore(progressContainer, form.firstChild);

    return progressBar;
}

// Mostrar animación de éxito sin reemplazar el formulario
async function showSuccessAnimation() {
    // Crear overlay oscuro para toda la página que permita ver el formulario detrás
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.5s ease;
        backdrop-filter: blur(5px);
    `;
    document.body.appendChild(overlay);
    
    // Permitir que se renderice antes de la animación
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
    
    // Crear contenedor de animación de carga
    const loaderContainer = document.createElement('div');
    loaderContainer.style.cssText = `
        text-align: center;
        transform: scale(0.8);
        opacity: 0;
        transition: all 0.5s ease;
        background-color: rgba(15, 23, 42, 0.8);
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    loaderContainer.innerHTML = `
        <div class="spinner-container" style="position: relative; width: 120px; height: 120px; margin: 0 auto 30px;">
            <div class="spinner-outer" style="
                position: absolute;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                border: 3px solid transparent;
                border-top-color: #3b82f6;
                animation: spin 1.5s linear infinite;
            "></div>
            <div class="spinner-middle" style="
                position: absolute;
                width: 90px;
                height: 90px;
                top: 15px;
                left: 15px;
                border-radius: 50%;
                border: 3px solid transparent;
                border-top-color: #60a5fa;
                animation: spin 2s linear infinite reverse;
            "></div>
            <div class="spinner-inner" style="
                position: absolute;
                width: 60px;
                height: 60px;
                top: 30px;
                left: 30px;
                border-radius: 50%;
                border: 3px solid transparent;
                border-top-color: #93c5fd;
                animation: spin 1s linear infinite;
            "></div>
            <div class="checkmark" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                color: #4ade80;
                font-size: 40px;
                opacity: 0;
                transition: all 0.5s ease;
            ">✓</div>
        </div>
        <h2 style="color: white; font-size: 24px; margin-bottom: 15px; opacity: 0; transform: translateY(20px); transition: all 0.5s ease;">¡Inicio exitoso!</h2>
        <p style="color: #94a3b8; margin-bottom: 30px; opacity: 0; transform: translateY(20px); transition: all 0.5s ease 0.2s;">Redirigiendo al dashboard...</p>
        <div class="loading-bar-container" style="
            width: 250px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin: 0 auto;
        ">
            <div class="loading-bar" style="
                height: 100%;
                width: 0;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                border-radius: 2px;
                transition: width 2s ease-out;
            "></div>
        </div>
    `;
    
    overlay.appendChild(loaderContainer);
    
    // Animar entrada del contenedor
    setTimeout(() => {
        loaderContainer.style.transform = 'scale(1)';
        loaderContainer.style.opacity = '1';
        
        // Animar textos después
        setTimeout(() => {
            const h2 = loaderContainer.querySelector('h2');
            const p = loaderContainer.querySelector('p');
            const bar = loaderContainer.querySelector('.loading-bar');
            
            if (h2) {
                h2.style.opacity = '1';
                h2.style.transform = 'translateY(0)';
            }
            
            if (p) {
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
            }
            
            if (bar) {
                bar.style.width = '100%';
            }
            
            // Mostrar checkmark al final
            setTimeout(() => {
                const spinners = loaderContainer.querySelectorAll('.spinner-outer, .spinner-middle, .spinner-inner');
                const checkmark = loaderContainer.querySelector('.checkmark');
                
                spinners.forEach(spinner => {
                    spinner.style.opacity = '0';
                    spinner.style.transition = 'opacity 0.5s ease';
                });
                
                if (checkmark) {
                    checkmark.style.transform = 'translate(-50%, -50%) scale(1)';
                    checkmark.style.opacity = '1';
                }
            }, 1500);
        }, 300);
    }, 100);
}

// Mostrar error de login con animación
function showLoginError() {
    const card = document.querySelector('.login-card');
    if (card) {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.animation = 'shake 0.6s ease-out';
    }
    const form = document.getElementById('loginForm');
    if (form) {
        form.style.display = 'block';
        form.style.opacity = '1';
    }

    // Mostrar mensaje de error con posicionamiento absoluto para no desplazar elementos
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.innerHTML = '⚠ Credenciales incorrectas. Verifique su información e intente nuevamente.';
        errorDiv.style.display = 'block';
        errorDiv.style.position = 'relative';
        errorDiv.style.animation = 'fadeIn 0.5s ease-out';
        errorDiv.style.maxHeight = '60px';
        errorDiv.style.marginBottom = '15px'; // Espacio adicional para evitar solapamiento
    }
    
    // Limpiar campos de contraseña
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.value = '';
        passwordField.focus();
    }
    
    // Restaurar los campos al estado normal con efecto visual de error
    const inputs = document.querySelectorAll('#loginForm input, #loginForm select');
    inputs.forEach(input => {
        // Asegurar que los inputs son visibles y habilitados
        input.style.display = 'block';
        input.disabled = false;
        
        if (input.value) {
            input.style.borderColor = 'var(--error-red)';
            input.style.background = 'rgba(239, 68, 68, 0.05)';
            
            setTimeout(() => {
                input.style.borderColor = 'var(--neutral-200)';
                input.style.background = 'white';
            }, 2000);
        }
    });
    
    // Restaurar el botón de envío
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Iniciar Sesión';
        submitButton.style.opacity = '1';
    }
    
    // Resetear animación
    setTimeout(() => {
        card.style.animation = '';
    }, 600);
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
    
    // Limpiar tooltips
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
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
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

// Exponer funciones globalmente
window.forgotPassword = () => {
    const card = document.querySelector('.login-card');
    card.style.animation = 'fadeOut 0.5s ease-out';
    setTimeout(() => {
        window.location.href = 'recovery.html';
    }, 500);
};

window.goToRegister = () => {
    const card = document.querySelector('.login-card');
    card.style.animation = 'fadeOut 0.5s ease-out';
    setTimeout(() => {
        window.location.href = 'register.html';
    }, 500);
};

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Estilos de fondo fijos
const fixBgStyles = document.createElement('style');
fixBgStyles.textContent = `
html, body {
    height: 100%;
    min-height: 100%;
    background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body {
    min-height: 100vh;
    height: 100vh;
    background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
    overflow-x: hidden;
}
.container {
    min-height: 100vh;
    height: 100vh;
    position: relative;
    background: transparent;
}
`;
document.head.appendChild(fixBgStyles);
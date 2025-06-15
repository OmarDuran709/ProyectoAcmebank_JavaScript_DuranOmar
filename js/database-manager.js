// Configuración de registro con gestor de BD
if (typeof window.isSubmitting === 'undefined') {
    window.isSubmitting = false;
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeRegisterPage();
});

// Inicializar página de registro con animaciones
async function initializeRegisterPage() {
    // Esperar a que se inicialice la base de datos
    await waitForDatabaseManager();
    
    // Animación de entrada
    animatePageEntry();
    
    // Configurar validaciones y formulario
    setupFormValidation();
    setupFormSubmission();
    setupInteractiveElements();
    setupAnimations();
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
        return false;
    }
    
    // Esperar a que esté inicializado
    await window.dbManager.waitForInitialization();
    console.log('✅ Database manager listo para registro');
    return true;
}

// Animación de entrada de página
function animatePageEntry() {
    const card = document.querySelector('.register-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.95)';
        
        setTimeout(() => {
            card.style.animation = 'fadeIn 0.8s ease-out forwards';
        }, 100);
    }
    
    // Animar campos del formulario secuencialmente
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateX(-30px)';
        
        setTimeout(() => {
            group.style.animation = 'slideInLeft 0.6s ease-out forwards';
        }, 200 + (index * 50));
    });
}

// Configurar animaciones interactivas
function setupAnimations() {
    // Animaciones hover para campos
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
            
            // Efecto glow en el label
            const label = this.parentNode.querySelector('label');
            if (label) {
                label.style.color = 'var(--primary-blue)';
                label.style.transform = 'translateY(-2px)';
            }
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
            
            const label = this.parentNode.querySelector('label');
            if (label) {
                label.style.color = 'var(--neutral-700)';
                label.style.transform = 'translateY(0)';
            }
        });
        
        // Animación de escritura
        input.addEventListener('input', function() {
            if (this.value) {
                this.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(59, 130, 246, 0.02))';
            } else {
                this.style.background = 'white';
            }
        });
    });
    
    // Animaciones para botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
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
}

// Configurar elementos interactivos
function setupInteractiveElements() {
    // Efecto de progreso en el formulario
    const inputs = document.querySelectorAll('input[required], select[required]');
    const progressBar = createProgressBar();
    
    inputs.forEach(input => {
        input.addEventListener('input', updateProgress);
        input.addEventListener('blur', updateProgress);
    });
    
    function updateProgress() {
        const filledInputs = Array.from(inputs).filter(input => input.value.trim() !== '');
        const progress = (filledInputs.length / inputs.length) * 100;
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.style.background = progress === 100 
                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        }
    }
}

// Crear barra de progreso
function createProgressBar() {
    const form = document.querySelector('.form');
    if (!form) return null;

    // Elimina todas las barras de progreso existentes antes de crear una nueva
    form.querySelectorAll('.progress-bar-container').forEach(el => el.remove());

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

// Configurar validación en tiempo real mejorada
function setupFormValidation() {
    const form = document.getElementById('registerForm');
    if (!form) return; // <-- Solución: salir si no existe el formulario

    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateFieldWithAnimation(this);
        });

        input.addEventListener('input', function() {
            clearFieldError(this);
            // Validación en tiempo real para algunos campos
            if (this.name === 'email' || this.name === 'numeroId') {
                debounce(() => validateFieldWithAnimation(this), 500)();
            }
        });
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validar campo con animaciones
function validateFieldWithAnimation(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Validaciones específicas mejoradas
    switch(field.name) {
        case 'numeroId':
            if (!/^\d{8,12}$/.test(value)) {
                isValid = false;
                errorMessage = 'El número de identificación debe tener entre 8 y 12 dígitos';
            }
            break;
            
        case 'nombres':
        case 'apellidos':
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(value)) {
                isValid = false;
                errorMessage = 'Solo se permiten letras y espacios (2-50 caracteres)';
            }
            break;
            
        case 'telefono':
            if (!/^3\d{9}$/.test(value)) {
                isValid = false;
                errorMessage = 'El teléfono debe iniciar con 3 y tener 10 dígitos';
            }
            break;
            
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Ingrese un email válido (ejemplo@dominio.com)';
            }
            break;
            
        case 'password':
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'La contraseña debe tener al menos 6 caracteres';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                isValid = false;
                errorMessage = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
            }
            break;
            
        case 'direccion':
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'La dirección debe tener al menos 10 caracteres';
            }
            break;
    }
    
    // Aplicar estilos y animaciones
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

// Mostrar éxito en campo con animación
function showFieldSuccess(field) {
    clearFieldError(field);
    
    field.classList.add('valid');
    field.classList.remove('invalid');
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
    
    // Animación de pulso
    field.style.animation = 'pulse 0.3s ease-out';
    setTimeout(() => field.style.animation = '', 300);
}

// Mostrar error en campo con animación
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('invalid');
    field.classList.remove('valid');
    field.style.borderColor = 'var(--error-red)';
    field.style.background = 'rgba(239, 68, 68, 0.05)';
    
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
    
    // Icono de error
    const errorIcon = document.createElement('div');
    errorIcon.className = 'field-icon error-icon';
    errorIcon.innerHTML = '⚠';
    errorIcon.style.cssText = `
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%) scale(0);
        color: var(--error-red);
        font-weight: bold;
        animation: shake 0.5s ease-out, bounceIn 0.5s ease-out forwards;
    `;
    
    field.parentNode.style.position = 'relative';
    field.parentNode.appendChild(errorDiv);
    field.parentNode.appendChild(errorIcon);
    
    // Animación de shake
    field.style.animation = 'shake 0.5s ease-out';
    setTimeout(() => field.style.animation = '', 500);
}

// Limpiar error de campo
function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    const icons = field.parentNode.querySelectorAll('.field-icon');
    
    if (errorDiv) {
        errorDiv.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }
    
    icons.forEach(icon => {
        icon.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => icon.remove(), 300);
    });
    
    field.classList.remove('valid', 'invalid');
    field.style.borderColor = 'var(--neutral-200)';
    field.style.background = 'white';
}

// Configurar envío del formulario con animaciones
function setupFormSubmission() {
    const form = document.getElementById('registerForm');
    if (!form) return; // <-- Solución: salir si no existe el formulario

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (window.isSubmitting) return;
        
        // Validar todos los campos
        const inputs = form.querySelectorAll('input, select');
        let isFormValid = true;
        
        // Animación de validación secuencial
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (!validateFieldWithAnimation(input) || !input.value.trim()) {
                isFormValid = false;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        if (!isFormValid) {
            showMessage('error', '⚠ Por favor corrija los errores en el formulario');
            // Scroll al primer error
            const firstError = form.querySelector('.invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }
        
        window.isSubmitting = true;
        
        // Recopilar datos del formulario
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);
        
        try {
            // Mostrar loading en botón
            const submitButton = form.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, true, 'Creando cuenta...');
            
            console.log('📝 Intentando registrar usuario:', userData.nombres, userData.apellidos);
            console.log('🆔 Identificación:', userData.tipoId, userData.numeroId);
            
            // Verificar si el usuario ya existe usando el método correcto
            const userExists = await window.dbManager.checkUserExists(userData.tipoId, userData.numeroId);
            
            if (userExists) {
                throw new Error('Ya existe un usuario registrado con esta identificación');
            }
            
            // Simular procesamiento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Crear nuevo usuario
            const newUser = await createUser(userData);
            
            // Animación de éxito
            await showSuccessAnimation(newUser);
            
            // Redirigir
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 4000);
            
        } catch (error) {
            console.error('❌ Error al registrar usuario:', error);
            showMessage('error', error.message || 'Error al crear la cuenta. Por favor intente nuevamente.');
            setButtonLoading(form.querySelector('button[type="submit"]'), false);
        } finally {
            window.isSubmitting = false;
        }
    });
}

// Crear usuario usando el gestor de BD
async function createUser(formData) {
    try {
        if (!window.dbManager) {
            throw new Error('Gestor de base de datos no disponible');
        }
        
        console.log('👤 Creando usuario con datos:', formData);
        
        // Crear objeto de usuario
        const userData = {
            tipoIdentificacion: formData.tipoId,
            numeroIdentificacion: formData.numeroId,
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            genero: formData.genero,
            telefono: formData.telefono,
            email: formData.email,
            direccion: formData.direccion,
            ciudad: formData.ciudad,
            password: await hashPassword(formData.password),
            numeroCuenta: window.dbManager.generateAccountNumber(),
            fechaCreacion: new Date().toLocaleDateString(),
            saldo: 0
        };
        
        // Guardar usuario en la base de datos
        const newUser = await window.dbManager.addUser(userData);
        
        console.log('✅ Usuario creado exitosamente:', newUser.nombres, newUser.apellidos);
        showNotification(`Cuenta creada para ${newUser.nombres} ${newUser.apellidos}`, 'success');
        
        return newUser;
        
    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        throw error;
    }
}

// Mostrar animación de éxito
async function showSuccessAnimation(newUser) {
    const form = document.querySelector('.form');
    form.style.animation = 'fadeOut 0.5s ease-out';
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verifica que newUser exista y tenga numeroCuenta
    const numeroCuenta = newUser && newUser.numeroCuenta ? newUser.numeroCuenta : '----';

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
            ">¡Bienvenido!</h2>
            <p style="
                color: var(--neutral-600);
                margin-bottom: 24px;
                animation: slideInUp 0.6s ease-out 0.5s both;
            ">Inicio de sesión exitoso</p>
            <div style="margin-bottom: 16px; font-size: 1.1rem;">
                <strong>Número de cuenta:</strong> ${numeroCuenta}
            </div>
            <div class="loading-bar" style="
                width: 100%;
                height: 4px;
                background: rgba(37, 99, 235, 0.1);
                border-radius: 2px;
                overflow: hidden;
                animation: slideInUp 0.6s ease-out 0.7s both;
            ">
                <div style="
                    height: 100%;
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    width: 0%;
                    animation: loadingProgress 2s ease-out forwards;
                "></div>
            </div>
        </div>
    `;

    form.style.animation = 'fadeIn 0.5s ease-out';
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
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Mostrar mensajes con animaciones
function showMessage(type, message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    
    if (type === 'error') {
        if (errorDiv) {
            errorDiv.innerHTML = message;
            errorDiv.style.display = 'block';
            errorDiv.style.animation = 'slideInUp 0.5s ease-out, shake 0.5s ease-out 0.5s';
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        if (successDiv) {
            successDiv.innerHTML = message;
            successDiv.style.display = 'block';
            successDiv.style.animation = 'slideInUp 0.5s ease-out';
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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

// Función para cancelar con animación
function cancelRegistration() {
    const form = document.querySelector('.register-card');
    
    if (confirm('¿Está seguro que desea cancelar el registro? Se perderán todos los datos ingresados.')) {
        form.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
}

// Inicializar "db.json" en localStorage si no existe
async function loadInitialDB() {
    if (!localStorage.getItem('db')) {
        // Carga el contenido de db.json aquí manualmente (copiado del archivo real)
        const initialDB = {
            "users": [
                {
                    "id": "1",
                    "tipoIdentificacion": "CC",
                    "numeroIdentificacion": "12345678",
                    "nombres": "Juan Carlos",
                    "apellidos": "Pérez González",
                    "genero": "M",
                    "telefono": "3001234567",
                    "email": "juan.perez@email.com",
                    "direccion": "Calle 123 #45-67",
                    "ciudad": "Bogotá",
                    "password": "123456",
                    "numeroCuenta": "1234567890",
                    "fechaCreacion": "15/01/2024",
                    "saldo": 2500000,
                    "fechaRegistro": "2024-01-15T10:30:00.000Z",
                    "ultimoAcceso": "2024-12-15T14:20:00.000Z"
                },
                {
                    "id": "2",
                    "tipoIdentificacion": "CC",
                    "numeroIdentificacion": "87654321",
                    "nombres": "María Elena",
                    "apellidos": "García López",
                    "genero": "F",
                    "telefono": "3009876543",
                    "email": "maria.garcia@email.com",
                    "direccion": "Carrera 45 #12-34",
                    "ciudad": "Medellín",
                    "password": "password123",
                    "numeroCuenta": "0987654321",
                    "fechaCreacion": "20/02/2024",
                    "saldo": 1800000,
                    "fechaRegistro": "2024-02-20T09:15:00.000Z",
                    "ultimoAcceso": "2024-12-14T16:45:00.000Z"
                }
            ],
            "transactions": [
                {
                    "id": "1",
                    "fecha": "15/12/2024",
                    "numeroReferencia": "123456",
                    "tipo": "consignacion",
                    "concepto": "Consignación inicial",
                    "valor": 2500000,
                    "numeroCuenta": "1234567890",
                    "fechaCreacion": "2024-01-15T10:30:00.000Z"
                },
                {
                    "id": "2",
                    "fecha": "20/12/2024",
                    "numeroReferencia": "789012",
                    "tipo": "consignacion",
                    "concepto": "Consignación inicial",
                    "valor": 1800000,
                    "numeroCuenta": "0987654321",
                    "fechaCreacion": "2024-02-20T09:15:00.000Z"
                }
            ],
            "settings": {
                "version": "1.0.0",
                "lastBackup": "2024-12-15T18:00:00.000Z",
                "maxTransactionAmount": 10000000,
                "dailyTransactionLimit": 50000000
            },
            "lastUpdated": "2024-12-15T18:00:00.000Z"
        };
        localStorage.setItem('db', JSON.stringify(initialDB));
    }
}
loadInitialDB();

// Agregar estilos CSS adicionales
if (!window.__additionalStylesInjected) {
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        @keyframes bounceIn {
            0% { transform: scale(0) translateY(-50%); opacity: 0; }
            50% { transform: scale(1.1) translateY(-50%); opacity: 1; }
            100% { transform: scale(1) translateY(-50%); opacity: 1; }
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
    `;
    document.head.appendChild(additionalStyles);
    window.__additionalStylesInjected = true;
}

// Simulación del gestor de base de datos
window.dbManager = {
    waitForInitialization: async () => true,
    checkUserExists: async (tipoId, numeroId) => {
        const db = JSON.parse(localStorage.getItem('db'));
        return db.users.some(
            u => u.tipoIdentificacion === tipoId && u.numeroIdentificacion === numeroId
        );
    },
    addUser: async (userData) => {
        const db = JSON.parse(localStorage.getItem('db'));
        const newUser = {
            ...userData,
            id: (db.users.length + 1).toString(),
            fechaRegistro: new Date().toISOString(),
            ultimoAcceso: new Date().toISOString()
        };
        db.users.push(newUser);
        localStorage.setItem('db', JSON.stringify(db));
        return newUser;
    },
    generateAccountNumber: () => {
        // Genera un número de cuenta único de 10 dígitos
        return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    },
    // --- AGREGA ESTE MÉTODO ---
    getUserByCredentials: async (tipoId, numeroId) => {
        const db = JSON.parse(localStorage.getItem('db'));
        return db.users.find(
            u => u.tipoIdentificacion === tipoId && u.numeroIdentificacion === numeroId
        ) || null;
    },
    // --- OPCIONAL: para actualizar usuario ---
    updateUser: async (id, data) => {
        const db = JSON.parse(localStorage.getItem('db'));
        const idx = db.users.findIndex(u => u.id === id);
        if (idx !== -1) {
            db.users[idx] = { ...db.users[idx], ...data };
            localStorage.setItem('db', JSON.stringify(db));
            return db.users[idx];
        }
        return null;
    }
};

// Exponer función globalmente
window.cancelRegistration = cancelRegistration;

// Función para hashear contraseña
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Convertir a string hexadecimal
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Al actualizar la contraseña:
// user.password = await hashPassword(nuevaContraseña);

// Por ejemplo, 30 minutos de sesión
const sessionDuration = 30 * 60 * 1000; // 30 minutos en ms
const expiration = Date.now() + sessionDuration;
localStorage.setItem('sessionExpiration', expiration);

// Función para actualizar la contraseña del usuario
async function actualizarPasswordUsuario(user, nuevaContraseña) {
    user.password = await hashPassword(nuevaContraseña);
    // Actualiza el usuario en localStorage si es necesario
    // ...
}
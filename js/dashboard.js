// Variables globales
let currentUser = null;
let saldoActual = 0;
let isAnimating = false;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Inicializar dashboard con animaciones
async function initializeDashboard() {
    try {
        // Mostrar loader inicial
        showPageLoader();
        
        // Verificar expiración de sesión
        checkSessionExpiration();
        
        // Cargar datos del usuario
        await loadCurrentUser();
        
        // Configurar componentes
        setupFormListeners();
        setupPrintButtons();
        setupAnimations();
        setupInteractiveElements();
        setupExtractoFilter();
        setupExtractoYearMonthOptions();
        
        // Mostrar fecha actual en certificado
        updateCurrentDate();
        
        // Ocultar loader
        hidePageLoader();
        
        // Animación de entrada
        animatePageEntry();
        
    } catch (error) {
        console.error('Error inicializando dashboard:', error);
        showErrorNotification('Error al cargar el dashboard');
    }
}

// Función para actualizar fecha actual en el certificado bancario
function updateCurrentDate() {
    const fechaElements = document.querySelectorAll('.fecha-actual');
    
    // Formato de fecha elegante (15 de junio de 2025)
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const fechaFormateada = new Date().toLocaleDateString('es-ES', options);
    
    // Actualizar en todos los lugares donde se use
    fechaElements.forEach(el => {
        el.textContent = fechaFormateada;
    });
    
    // También actualizar la fecha en el certificado bancario si existe
    const certificadoFecha = document.querySelector('#certificado .fecha-certificado');
    if (certificadoFecha) {
        certificadoFecha.textContent = fechaFormateada;
    }
}

// Mostrar loader de página
function showPageLoader() {
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.innerHTML = `
        <div class="loader-container">
            <div class="loader-spinner"></div>
            <p>Cargando dashboard...</p>
        </div>
    `;
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .loader-container {
            text-align: center;
            animation: fadeIn 0.5s ease-out;
        }
        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(loader);
}

// Ocultar loader de página
function hidePageLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => loader.remove(), 500);
    }
}

// Animación de entrada de página
function animatePageEntry() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar) {
        sidebar.style.transform = 'translateX(-100%)';
        sidebar.style.animation = 'slideInLeft 0.8s ease-out 0.2s forwards';
    }
    
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(30px)';
        mainContent.style.animation = 'fadeIn 0.8s ease-out 0.4s forwards';
    }
}

// Cargar usuario actual
async function loadCurrentUser() {
    return new Promise((resolve, reject) => {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                currentUser = JSON.parse(userData);
                updateUserInterface();
                resolve();
            } else {
                showErrorNotification('Sesión expirada. Redirigiendo...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                reject('No user data');
            }
        } catch (error) {
            reject(error);
        }
    });
}

// Actualizar interfaz con animaciones
function updateUserInterface() {
    if (currentUser) {
        // Actualizar nombre en sidebar con animación
        const userNameElement = document.querySelector('.sidebar-header p');
        if (userNameElement) {
            animateTextChange(userNameElement, `${currentUser.nombres} ${currentUser.apellidos}`);
        }
        
        // Actualizar información de cuenta
        updateAccountInfo();
        
        // Actualizar tabla de transacciones
        updateTransactionsTable();
        
        // Después de cargar currentUser o al mostrar la sección de certificado:
        updateCertificadoBancario();
    }
}

// Animación de cambio de texto
function animateTextChange(element, newText) {
    element.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        element.textContent = newText;
        element.style.animation = 'fadeIn 0.3s ease-out';
    }, 300);
}

// Actualizar información de cuenta con animaciones
function updateAccountInfo() {
    const accountElements = document.querySelectorAll('.account-info-box');
    accountElements.forEach((element, index) => {
        setTimeout(() => {
            // Detecta si es la sección de extracto
            const cuentaSpan = element.querySelector('#extracto-numero-cuenta');
            const titularSpan = element.querySelector('#extracto-titular');
            if (cuentaSpan && titularSpan) {
                cuentaSpan.textContent = currentUser.numeroCuenta;
                titularSpan.textContent = `${currentUser.nombres} ${currentUser.apellidos}`;
            } else {
                // Para las demás secciones
                element.innerHTML = `
                    <p><strong>Número de Cuenta:</strong> ${currentUser.numeroCuenta}</p>
                    <p><strong>Titular:</strong> ${currentUser.nombres} ${currentUser.apellidos}</p>
                    <p><strong>Saldo Disponible:</strong> $${saldoActual.toLocaleString()}</p>
                `;
            }
            element.style.animation = 'slideInLeft 0.6s ease-out';
        }, index * 100);
    });
    
    // Actualizar resumen principal con contador animado
    const accountSummary = document.querySelector('.account-info');
    if (accountSummary) {
        accountSummary.innerHTML = `
            <div class="info-item hover-lift">
                <span class="label">Número de Cuenta</span>
                <span class="value">${currentUser.numeroCuenta}</span>
            </div>
            <div class="info-item hover-lift">
                <span class="label">Saldo Actual</span>
                <span class="value" id="saldoCounter">$0</span>
            </div>
            <div class="info-item hover-lift">
                <span class="label">Fecha de Creación</span>
                <span class="value">${currentUser.fechaCreacion}</span>
            </div>
        `;
        
        // Animar contador de saldo
        animateCounter('saldoCounter', 0, saldoActual, 2000, '$');
    }
}

// Actualizar datos del certificado bancario
function updateCertificadoBancario() {
    if (!currentUser) return;
    
    const nombre = `${currentUser.nombres} ${currentUser.apellidos}`;
    const tipoId = currentUser.tipoIdentificacion || 'CC';
    const numeroId = currentUser.numeroIdentificacion || '';
    const numeroCuenta = currentUser.numeroCuenta || '';
    const fechaCreacion = currentUser.fechaCreacion || '';

    // Actualizar elementos en el DOM
    const certificadoNombre = document.getElementById('certificado-nombre');
    const certificadoTipoId = document.getElementById('certificado-tipo-id');
    const certificadoNumeroId = document.getElementById('certificado-numero-id');
    const certificadoNumeroCuenta = document.getElementById('certificado-numero-cuenta');
    const certificadoFechaCreacion = document.getElementById('certificado-fecha-creacion');

    if (certificadoNombre) certificadoNombre.textContent = nombre;
    if (certificadoTipoId) certificadoTipoId.textContent = tipoId;
    if (certificadoNumeroId) certificadoNumeroId.textContent = numeroId;
    if (certificadoNumeroCuenta) certificadoNumeroCuenta.textContent = numeroCuenta;
    if (certificadoFechaCreacion) certificadoFechaCreacion.textContent = fechaCreacion;
}

// Animación de contador
function animateCounter(elementId, start, end, duration, prefix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = performance.now();
    const difference = end - start;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (difference * easeOut));
        
        element.textContent = `${prefix}${current.toLocaleString()}`;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Función para mostrar secciones con animaciones
function showSection(sectionId) {
    if (isAnimating) return;
    
    isAnimating = true;
    
    // Ocultar sección actual con animación
    const currentSection = document.querySelector('.content-section.active');
    if (currentSection) {
        currentSection.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            currentSection.classList.remove('active');
            
            // Mostrar nueva sección
            const newSection = document.getElementById(sectionId);
            if (newSection) {
                newSection.classList.add('active');
                newSection.style.animation = 'fadeIn 0.5s ease-out';
                
                // Animar elementos internos
                animateSectionElements(newSection);
            }
            
            isAnimating = false;
        }, 300);
    } else {
        // Primera carga
        const newSection = document.getElementById(sectionId);
        if (newSection) {
            newSection.classList.add('active');
            animateSectionElements(newSection);
        }
        isAnimating = false;
    }
    
    // Actualizar menú activo con animación
    updateActiveMenuItem(sectionId);
}

// Animar elementos de sección
function animateSectionElements(section) {
    const elements = section.querySelectorAll('.transaction-form, .transactions-table, .certificate, .account-summary');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        setTimeout(() => {
            element.style.animation = 'slideInUp 0.6s ease-out forwards';
        }, index * 100);
    });
}

// Actualizar menú activo
function updateActiveMenuItem(sectionId) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        item.style.transform = 'translateX(0)';
    });
    
    const activeMenuItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
        activeMenuItem.style.animation = 'pulse 0.6s ease-out';
    }
}

// Configurar animaciones interactivas
function setupAnimations() {
    // Animaciones hover para botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
    });
    
    // Animaciones para campos de formulario
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// Configurar elementos interactivos
function setupInteractiveElements() {
    // Efecto ripple para botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
    
    // Animaciones para tarjetas
    const cards = document.querySelectorAll('.info-item, .transaction-form, .certificate');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });

}

// Configurar botón de eliminar cuenta
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function() {
        const modal = document.getElementById('deleteAccountModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.style.animation = 'fadeIn 0.3s ease-out';
        }
    });
}

// Configurar botones del modal de eliminar cuenta
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', function() {
        const modal = document.getElementById('deleteAccountModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', function() {
        this.disabled = true;
        this.innerHTML = '<span class="loading-spinner"></span> Eliminando...';
        
        // Proceso de eliminación
        setTimeout(() => {
            deleteUserAccount();
        }, 1500);
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
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Generar número de referencia
function generateReference() {
    return Math.floor(Math.random() * 900000) + 100000;
}

// Mostrar mensaje con animaciones mejoradas
function showMessage(elementId, type, message) {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.className = `alert alert-${type}`;
        messageDiv.innerHTML = message;
        messageDiv.style.display = 'block';
        messageDiv.style.animation = 'slideInUp 0.5s ease-out';
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            messageDiv.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 500);
        }, 5000);
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

// Mostrar notificación de error
function showErrorNotification(message) {
    showNotification(message, 'error');
}

// Función para verificar si la sesión ha expirado
function checkSessionExpiration() {
    // Obtener timestamp de la última actividad
    const lastActivity = localStorage.getItem('lastActivity');
    const currentTime = Date.now();
    
    // IMPORTANTE: No verificar expiración en el primer inicio de sesión
    // Solo verificar expiración si existe un registro previo de actividad y ha pasado mucho tiempo
    if (lastActivity && (currentTime - parseInt(lastActivity)) > 1800000) {
        showErrorNotification('Tu sesión ha expirado. Por favor vuelve a iniciar sesión.');
        
        // Limpiar datos de sesión para evitar ciclos
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastActivity');
        
        // Redirigir a la página de login después de un pequeño retraso
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
        return false;
    }
    
    // Actualizar timestamp de última actividad
    localStorage.setItem('lastActivity', currentTime.toString());
    return true;
}

// Configurar event listeners para formularios
function setupFormListeners() {
    // Consignación con animaciones
    const consignacionForm = document.getElementById('consignacionForm');
    if (consignacionForm) {
        consignacionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            try {
                const valor = parseFloat(document.getElementById('valorConsignacion').value);

                if (valor <= 0) {
                    showMessage('consignacionMessage', 'error', 'Ingrese un valor válido');
                    setButtonLoading(submitButton, false);
                    return;
                }

                setButtonLoading(submitButton, true);
                await new Promise(resolve => setTimeout(resolve, 1500));

                const referencia = generateReference();
                const oldSaldo = saldoActual;
                saldoActual += valor;
                updateUserSaldoInDB(saldoActual);
                updateAccountInfo();

                saveTransaction('consignacion', 'Consignación por canal electrónico', valor, referencia);

                showMessage('consignacionMessage', 'success', 
                    `✓ Consignación realizada exitosamente<br>
                    <strong>Referencia:</strong> ${referencia}<br>
                    <strong>Valor:</strong> $${valor.toLocaleString()}`);

                showNotification(`Consignación de $${valor.toLocaleString()} realizada exitosamente`);

                this.reset();
                setButtonLoading(submitButton, false);
                animateBalanceChange(oldSaldo, saldoActual);
            } catch (error) {
                setButtonLoading(submitButton, false);
                showErrorNotification('Ocurrió un error inesperado. Intenta de nuevo.');
                console.error(error);
            }
        });
    }

    // Retiro con animaciones
    const retiroForm = document.getElementById('retiroForm');
    if (retiroForm) {
        retiroForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            try {
                const valor = parseFloat(document.getElementById('valorRetiro').value);

                if (valor <= 0) {
                    showMessage('retiroMessage', 'error', 'Ingrese un valor válido');
                    setButtonLoading(submitButton, false);
                    return;
                }

                if (valor > saldoActual) {
                    showMessage('retiroMessage', 'error', '⚠ Saldo insuficiente para realizar esta operación');
                    setButtonLoading(submitButton, false);
                    return;
                }

                setButtonLoading(submitButton, true);
                await new Promise(resolve => setTimeout(resolve, 1500));

                const referencia = generateReference();
                const oldSaldo = saldoActual;
                saldoActual -= valor;
                updateUserSaldoInDB(saldoActual);
                updateAccountInfo();

                saveTransaction('retiro', 'Retiro de dinero', valor, referencia);

                showMessage('retiroMessage', 'success', 
                    `✓ Retiro realizado exitosamente<br>
                    <strong>Referencia:</strong> ${referencia}<br>
                    <strong>Valor:</strong> $${valor.toLocaleString()}`);

                showNotification(`Retiro de $${valor.toLocaleString()} realizado exitosamente`);

                this.reset();
                setButtonLoading(submitButton, false);
                animateBalanceChange(oldSaldo, saldoActual);
            } catch (error) {
                setButtonLoading(submitButton, false);
                showErrorNotification('Ocurrió un error inesperado. Intenta de nuevo.');
                console.error(error);
            }
        });
    }

    // Pago de servicios con animaciones
    const serviciosForm = document.getElementById('serviciosForm');
    if (serviciosForm) {
        serviciosForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            try {
                const servicio = document.getElementById('servicio').value;
                const valor = parseFloat(document.getElementById('valorServicio').value);

                if (!servicio || valor <= 0) {
                    showMessage('serviciosMessage', 'error', 'Complete todos los campos correctamente');
                    setButtonLoading(submitButton, false);
                    return;
                }

                if (valor > saldoActual) {
                    showMessage('serviciosMessage', 'error', '⚠ Saldo insuficiente para realizar esta operación');
                    setButtonLoading(submitButton, false);
                    return;
                }

                setButtonLoading(submitButton, true);
                await new Promise(resolve => setTimeout(resolve, 2000));

                const referencia = generateReference();
                const oldSaldo = saldoActual;
                saldoActual -= valor;
                updateUserSaldoInDB(saldoActual);
                updateAccountInfo();

                saveTransaction('retiro', `Pago de servicio público ${servicio}`, valor, referencia);

                showMessage('serviciosMessage', 'success', 
                    `✓ Pago de ${servicio} realizado exitosamente<br>
                    <strong>Referencia:</strong> ${referencia}<br>
                    <strong>Valor:</strong> $${valor.toLocaleString()}`);

                showNotification(`Pago de ${servicio} por $${valor.toLocaleString()} realizado exitosamente`);

                this.reset();
                setButtonLoading(submitButton, false);
                animateBalanceChange(oldSaldo, saldoActual);
            } catch (error) {
                setButtonLoading(submitButton, false);
                showErrorNotification('Ocurrió un error inesperado. Intenta de nuevo.');
                console.error(error);
            }
        });
    }
}

// Función para mostrar el extracto bancario
function mostrarExtracto() {
    const extractoSection = document.getElementById('extracto');
    const loader = document.getElementById('extractoLoader');
    
    if (!extractoSection || !loader) return;
    
    // Mostrar loader
    loader.style.display = 'flex';
    
    setTimeout(() => {
        // Ocultar loader
        loader.style.display = 'none';
        
        // Mostrar sección de extracto
        extractoSection.style.display = 'block';
        
        // Actualizar tabla de extracto
        updateExtractoTable();
    }, 1500);
}

// Configurar opciones de año y mes para el extracto bancario
function setupExtractoYearMonthOptions() {
    const añoSelect = document.getElementById('año');
    const mesSelect = document.getElementById('mes');
    if (!añoSelect || !mesSelect) return;

    // Obtener todas las transacciones del usuario actual
    const db = JSON.parse(localStorage.getItem('db') || '{"users":[]}');
    const idx = db.users.findIndex(u => u.numeroCuenta === currentUser.numeroCuenta);
    let userTransactions = [];
    if (idx !== -1 && Array.isArray(db.users[idx].transacciones)) {
        userTransactions = db.users[idx].transacciones;
    }

    // Buscar año más antiguo y año actual
    let minYear = new Date().getFullYear();
    userTransactions.forEach(t => {
        if (t.fecha) {
            // El formato de fecha es MM/DD/YYYY (formato estadounidense)
            const partes = t.fecha.split('/');
            if (partes.length === 3) {
                const añoT = parseInt(partes[2]);
                if (añoT < minYear) minYear = añoT;
            }
        }
    });
    const now = new Date();
    const maxYear = now.getFullYear();

    // Limpiar y llenar opciones de año - AGREGAR OPCIÓN VACÍA
    añoSelect.innerHTML = '';
    
    // Agregar opción vacía primero
    const emptyYearOpt = document.createElement('option');
    emptyYearOpt.value = '';
    emptyYearOpt.textContent = 'Seleccione año';
    añoSelect.appendChild(emptyYearOpt);
    
    // Luego agregar años disponibles
    for (let y = maxYear; y >= minYear; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        añoSelect.appendChild(opt);
    }

    // Función para actualizar opciones de mes
    function updateMesOptions() {
        const selectedYear = parseInt(añoSelect.value);
        let maxMonth = 12;
        if (selectedYear === maxYear) {
            maxMonth = now.getMonth() + 1; // getMonth es 0-indexado
        }
        
        mesSelect.innerHTML = '';
        
        // Agregar opción vacía primero
        const emptyMonthOpt = document.createElement('option');
        emptyMonthOpt.value = '';
        emptyMonthOpt.textContent = 'Seleccione mes';
        mesSelect.appendChild(emptyMonthOpt);
        
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        for (let m = 1; m <= maxMonth; m++) {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = meses[m - 1];
            mesSelect.appendChild(opt);
        }
    }

    // Configurar event listener para actualizar meses cuando cambia el año
    añoSelect.addEventListener('change', updateMesOptions);
    updateMesOptions();  // Ejecutar una vez al inicio para configurar los meses
}

// Configurar filtro de extracto bancario
function setupExtractoFilter() {
    const añoSelect = document.getElementById('año');
    const mesSelect = document.getElementById('mes');
    if (!añoSelect || !mesSelect) return;

    function updateExtractoTable() {
        const año = añoSelect.value;
        const mes = mesSelect.value;
        const tbody = document.querySelector('#extracto tbody');
        if (!tbody) return;
        
        console.log("Buscando transacciones para:", año, mes);

        let db = JSON.parse(localStorage.getItem('db'));
        const idx = db.users.findIndex(u => u.numeroCuenta === currentUser.numeroCuenta);
        let userTransactions = [];
        if (idx !== -1 && Array.isArray(db.users[idx].transacciones)) {
            userTransactions = db.users[idx].transacciones;
            console.log("Transacciones del usuario:", userTransactions);
        }

        // Filtrar por año y mes (si ambos están seleccionados)
        const transaccionesFiltradas = userTransactions.filter(t => {
            if (!t.fecha) return false;
            const partes = t.fecha.split('/');
            if (partes.length !== 3) return false;
            
            // Verificar si los filtros están activos
            const añoSeleccionado = año !== '' && año !== 'Todos';
            const mesSeleccionado = mes !== '' && mes !== 'Todos';
            
            // Si no hay filtros activos, mostrar todas las transacciones
            if (!añoSeleccionado && !mesSeleccionado) return true;
            
            // El formato de fecha es MM/DD/YYYY (formato estadounidense)
            const añoTx = String(partes[2]);
            const mesTx = String(Number(partes[0])); // El mes está en la posición 0
            
            // Aplicar filtros según lo que esté seleccionado
            if (añoSeleccionado && mesSeleccionado) {
                return añoTx === año && mesTx === String(Number(mes));
            } else if (añoSeleccionado) {
                return añoTx === año;
            } else if (mesSeleccionado) {
                return mesTx === String(Number(mes));
            }
            
            return true;
        });

        console.log("Transacciones filtradas:", transaccionesFiltradas);

        tbody.innerHTML = '';
        if (transaccionesFiltradas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay transacciones para este periodo.</td></tr>`;
        } else {
            transaccionesFiltradas.forEach(tx => {
                tbody.innerHTML += `
                    <tr>
                        <td>${tx.fecha}</td>
                        <td>${tx.numeroReferencia || ''}</td>
                        <td><span class="${tx.tipo}">${tx.tipo}</span></td>
                        <td>${tx.concepto}</td>
                        <td class="${tx.tipo === 'consignacion' ? 'positive' : 'negative'}" style="text-align: right; font-weight: 700;">
                            ${tx.tipo === 'consignacion' ? '+' : '-'}$${Number(tx.valor).toLocaleString()}
                        </td>
                    </tr>
                `;
            });
        }
    }

    añoSelect.addEventListener('change', updateExtractoTable);
    mesSelect.addEventListener('change', updateExtractoTable);
    updateExtractoTable();  // Ejecutar una vez al inicio para mostrar datos
}

// Función para mostrar el certificado bancario
function mostrarCertificado() {
    const certificadoSection = document.getElementById('certificado');
    const loader = document.getElementById('certificadoLoader');
    
    if (!certificadoSection || !loader) return;
    
    // Mostrar loader
    loader.style.display = 'flex';
    
    setTimeout(() => {
        // Ocultar loader
        loader.style.display = 'none';
        
        // Mostrar sección de certificado
        certificadoSection.style.display = 'block';
        
        // Actualizar datos del certificado
        updateCertificadoBancario();
    }, 1500);
}

// Función para mostrar el resumen de transacciones
function mostrarResumenTransacciones() {
    const resumenSection = document.getElementById('resumen');
    const loader = document.getElementById('resumenLoader');
    
    if (!resumenSection || !loader) return;
    
    // Mostrar loader
    loader.style.display = 'flex';
    
    setTimeout(() => {
        // Ocultar loader
        loader.style.display = 'none';
        
        // Mostrar sección de resumen
        resumenSection.style.display = 'block';
        
        // Actualizar tabla de transacciones
        updateTransactionsTable();
    }, 1500);
}

// Función para cerrar sesión
function logout() {
    // Mostrar notificación
    showNotification('Cerrando sesión...');
    
    // Eliminar datos de sesión del localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lastActivity');
    
    // Esperar un momento para que se muestre la notificación
    setTimeout(() => {
        // Redirigir a la página de login
        window.location.href = 'login.html';
    }, 1000);
}

// Mostrar modal de cierre de sesión
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.animation = 'fadeIn 0.3s ease-out';
    }
}

// Agregar evento al botón de confirmación de cierre de sesión
document.addEventListener('DOMContentLoaded', function() {
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', logout);
    }
});

// Cerrar modal de cierre de sesión
function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// Configurar botones de impresión mejorados
function setupPrintButtons() {
    // Botón de Extracto Bancario
    const printExtractBtn = document.getElementById('printExtractBtn');
    if (printExtractBtn) {
        printExtractBtn.addEventListener('click', function(e) {
            e.preventDefault();
            printExtractoBancario();
        });
    }
    
    // Botón de Certificado Bancario
    const printCertificateBtn = document.getElementById('printCertificateBtn');
    if (printCertificateBtn) {
        printCertificateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            printCertificadoBancario();
        });
    }
    
    // Botón de Resumen de Transacciones
    const printTransactionsBtn = document.getElementById('printTransactionsBtn');
    if (printTransactionsBtn) {
        printTransactionsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            printResumenTransacciones();
        });
    }
    
    // Eliminar los onclick antiguos de todos los botones de impresión
    const oldPrintButtons = document.querySelectorAll('.btn-primary[onclick*="print"]');
    oldPrintButtons.forEach(button => {
        button.onclick = null;
    });
}

// Imprimir sección con animación
function printSectionWithAnimation(sectionId, title) {
    // Mostrar notificación de preparación
    showNotification('Preparando documento para impresión...', 'success');
    
    setTimeout(() => {
        printSection(sectionId, title);
    }, 1000);
}

// Función mejorada para imprimir
function printSection(sectionId, title) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const printWindow = window.open('', '_blank');
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title} - Banco Digital</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Arial', sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 20px;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #2563eb;
                }
                .print-header h1 {
                    color: #1e3c72;
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                    font-weight: 800;
                }
                .print-header h2 {
                    color: #2563eb;
                    font-size: 1.5rem;
                    margin-bottom: 20px;
                }
                .print-info {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                    border-left: 4px solid #2563eb;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e2e8f0;
                }
                th {
                    background: #f1f5f9;
                    font-weight: 700;
                    color: #374151;
                }
                .positive { color: #059669; font-weight: 700; }
                .negative { color: #dc2626; font-weight: 700; }
                .certificate-content {
                    line-height: 1.8;
                    text-align: justify;
                    font-size: 1.1rem;
                }
                .certificate-content p {
                    margin-bottom: 20px;
                }
                .signature {
                    text-align: center;
                    margin-top: 60px;
                }
                .signature-line {
                    width: 250px;
                    height: 2px;
                    background: #374151;
                    margin: 0 auto 15px;
                }
                @media print {
                    body { margin: 0; }
                    .print-header { page-break-after: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>BANCO DIGITAL</h1>
                <h2>${title}</h2>
                <div class="print-info">
                    <p><strong>Fecha de impresión:</strong> ${new Date().toLocaleDateString()}</p>
                    ${currentUser ? `<p><strong>Cliente:</strong> ${currentUser.nombres} ${currentUser.apellidos}</p>` : ''}
                    ${currentUser ? `<p><strong>Cuenta  ${currentUser.apellidos}</p>` : ''}
                    ${currentUser ? `<p><strong>Cuenta:</strong> ${currentUser.numeroCuenta}</p>` : ''}
                </div>
            </div>
            ${section.innerHTML}
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
        showNotification('Documento enviado a impresión exitosamente');
    };
}

// Función para imprimir el extracto bancario en un PDF bonito
function printExtractoBancario() {
    // Obtener valores de filtro actuales
    const año = document.getElementById('año').value || 'Todos';
    const mes = document.getElementById('mes').value ? 
        ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 
         'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][parseInt(document.getElementById('mes').value)-1] 
        : 'Todos';
    
    // Obtener datos del usuario actual
    if (!currentUser) {
        showErrorNotification('Error: No hay usuario activo');
        return;
    }
    
    // Obtener tabla de transacciones
    const tablaDatos = document.querySelector('#extracto .transactions-table').cloneNode(true);
    
    // Si no hay transacciones, mostrar mensaje amigable
    const filas = tablaDatos.querySelectorAll('tbody tr');
    let contenidoTabla = '';
    if (filas.length === 0 || (filas.length === 1 && filas[0].textContent.includes('No hay transacciones'))) {
        contenidoTabla = `<tr><td colspan="5" style="text-align:center; padding: 30px;">No hay transacciones en este período.</td></tr>`;
    } else {
        // Construir filas de tabla para el PDF
        Array.from(filas).forEach(fila => {
            contenidoTabla += fila.outerHTML.replace(/<td/g, '<td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"');
        });
    }

    // Crear ventana de impresión con estilo mejorado
    const printWindow = window.open('', '_blank');
    
    // Fecha formateada
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const contenidoPDF = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Extracto Bancario - ${currentUser.nombres} ${currentUser.apellidos}</title>
            <style>
                @page { size: A4; margin: 2cm; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6;
                    color: #1e293b;
                    background: #fff;
                    margin: 0;
                    padding: 0 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    position: relative;
                }
                .header::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80%;
                    height: 3px;
                    background: linear-gradient(90deg, #1e3c72, #2a5298, #1e3c72);
                }
                .header h1 {
                    color: #1e3c72;
                    font-size: 28px;
                    margin: 0 0 15px;
                }
                .header h2 {
                    color: #2a5298;
                    font-size: 20px;
                    margin: 0 0 10px;
                    font-weight: 600;
                }
                .fecha {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 10px;
                }
                .extracto-info {
                    margin: 30px 0;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 10px;
                    border-left: 5px solid #2563eb;
                }
                .extracto-info p {
                    margin: 10px 0;
                }
                .periodo {
                    background: #e0f2fe;
                    border-radius: 8px;
                    padding: 10px 15px;
                    margin: 25px 0;
                    color: #0c4a6e;
                    font-weight: 600;
                    text-align: center;
                    border: 1px solid #bae6fd;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 30px;
                }
                th {
                    background: #e2e8f0;
                    color: #334155;
                    text-align: left;
                    padding: 15px 12px;
                    font-weight: 700;
                    border-top: 2px solid #cbd5e1;
                    border-bottom: 2px solid #cbd5e1;
                }
                td {
                    padding: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                tr:nth-child(even) {
                    background-color: #f8fafc;
                }
                .consignacion {
                    color: #16a34a;
                    font-weight: 600;
                }
                .retiro {
                    color: #dc2626;
                    font-weight: 600;
                }
                .footer {
                    margin-top: 50px;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #64748b;
                }
                .watermark {
                    position: fixed;
                    bottom: 3cm;
                    right: 3cm;
                    transform: rotate(-45deg);
                    font-size: 80px;
                    color: rgba(200, 200, 200, 0.1);
                    z-index: -1;
                }
            </style>
        </head>
        <body>
            <div class="watermark">BANCO DIGITAL</div>
            <div class="header">
                <h1>BANCO DIGITAL</h1>
                <h2>EXTRACTO BANCARIO</h2>
                <div class="fecha">Generado el: ${fechaActual}</div>
            </div>
            
            <div class="extracto-info">
                <p><strong>Número de Cuenta:</strong> ${currentUser.numeroCuenta}</p>
                <p><strong>Titular:</strong> ${currentUser.nombres} ${currentUser.apellidos}</p>
                <p><strong>Fecha de Apertura:</strong> ${currentUser.fechaCreacion}</p>
            </div>
            
            <div class="periodo">
                <p>Período: ${mes} ${año}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Referencia</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Concepto</th>
                        <th scope="col">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${contenidoTabla}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Este documento es informativo y no constituye un estado de cuenta oficial.</p>
                <p>Banco Digital © ${new Date().getFullYear()} | Tel: (601) 123-4567 | bancodigital@ejemplo.com</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(contenidoPDF);
    printWindow.document.close();
    
    // Esperar a que cargue el contenido antes de imprimir
    printWindow.onload = function() {
        printWindow.print();
        // No cerramos la ventana automáticamente para que el usuario pueda descargar el PDF
    };
}

// Función para imprimir el certificado bancario en un PDF bonito
function printCertificadoBancario() {
    // Obtener datos del usuario actual
    if (!currentUser) {
        showErrorNotification('Error: No hay usuario activo');
        return;
    }
    
    // Crear ventana de impresión con estilo mejorado
    const printWindow = window.open('', '_blank');
    
    // Fecha formateada
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const contenidoPDF = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Certificado Bancario - ${currentUser.nombres} ${currentUser.apellidos}</title>
            <style>
                @page { size: A4; margin: 2cm; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6;
                    color: #1e293b;
                    background: #fff;
                    margin: 0;
                    padding: 0 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    position: relative;
                }
                .header::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80%;
                    height: 3px;
                    background: linear-gradient(90deg, #1e3c72, #2a5298, #1e3c72);
                }
                .header h1 {
                    color: #1e3c72;
                    font-size: 28px;
                    margin: 0 0 15px;
                }
                .header h2 {
                    color: #2a5298;
                    font-size: 20px;
                    margin: 0 0 10px;
                    font-weight: 600;
                }
                .fecha {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 10px;
                }
                .certificate-content {
                    margin: 50px 0;
                    padding: 40px 30px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    font-size: 16px;
                    line-height: 1.8;
                    text-align: justify;
                }
                .certificate-content p {
                    margin-bottom: 20px;
                }
                .footer {
                    margin-top: 60px;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #64748b;
                }
                .signature {
                    margin-top: 70px;
                    text-align: center;
                }
                .signature-line {
                    width: 220px;
                    height: 2px;
                    background: #1e3c72;
                    margin: 0 auto 10px;
                }
                .signature-name {
                    font-weight: 700;
                    color: #1e3c72;
                    font-size: 18px;
                    margin-bottom: 5px;
                }
                .signature-title {
                    font-size: 14px;
                    color: #64748b;
                }
                .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 100px;
                    color: rgba(200, 200, 200, 0.1);
                    z-index: -1;
                    pointer-events: none;
                }
                .sello {
                    position: absolute;
                    bottom: 100px;
                    right: 50px;
                    width: 120px;
                    height: 120px;
                    border: 2px solid #1e3c72;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    font-size: 12px;
                    color: #1e3c72;
                    font-weight: bold;
                    transform: rotate(15deg);
                    opacity: 0.8;
                }
            </style>
        </head>
        <body>
            <div class="watermark">BANCO DIGITAL</div>
            <div class="header">
                <h1>BANCO DIGITAL</h1>
                <h2>CERTIFICADO BANCARIO</h2>
                <div class="fecha">Generado el: ${fechaActual}</div>
            </div>
            
            <div class="certificate-content">
                <p>
                    <strong>EL BANCO DIGITAL</strong> certifica que el(la) señor(a)
                    <strong>${currentUser.nombres} ${currentUser.apellidos}</strong>,
                    identificado(a) con ${currentUser.tipoIdentificacion || 'CC'} número
                    <strong>${currentUser.numeroIdentificacion}</strong>,
                    es titular de la cuenta de ahorros número
                    <strong>${currentUser.numeroCuenta}</strong>.
                </p>
                <p>
                    La mencionada cuenta fue abierta el
                    <strong>${currentUser.fechaCreacion}</strong>
                    y se encuentra <strong>ACTIVA</strong> a la fecha de expedición del presente certificado.
                </p>
                <p>
                    Este certificado se expide a solicitud del interesado para los fines que estime convenientes.
                </p>
                
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">CARLOS RODRÍGUEZ MENDEZ</div>
                    <div class="signature-title">Gerente General</div>
                    <div class="signature-title">BANCO DIGITAL S.A.</div>
                </div>
                
                <div class="sello">
                    DOCUMENTO<br>
                    CERTIFICADO<br>
                    BANCO DIGITAL
                </div>
            </div>
            
            <div class="footer">
                <p>Este certificado es válido a la fecha de su expedición.</p>
                <p>Banco Digital © ${new Date().getFullYear()} | Tel: (601) 123-4567 | bancodigital@ejemplo.com</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(contenidoPDF);
    printWindow.document.close();
    
    // Esperar a que cargue el contenido antes de imprimir
    printWindow.onload = function() {
        printWindow.print();
        // No cerramos la ventana automáticamente para que el usuario pueda descargar el PDF
    };
}

// Función para imprimir el resumen de transacciones en un PDF bonito
function printResumenTransacciones() {
    // Obtener datos del usuario actual
    if (!currentUser) {
        showErrorNotification('Error: No hay usuario activo');
        return;
    }
    
    // Obtener transacciones del usuario
    let db = JSON.parse(localStorage.getItem('db'));
    const idx = db.users.findIndex(u => u.numeroCuenta === currentUser.numeroCuenta);
    let userTransactions = [];
    if (idx !== -1 && Array.isArray(db.users[idx].transacciones)) {
        userTransactions = db.users[idx].transacciones
            .slice()
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 10);
    }
    
    // Construir filas de tabla para el PDF
    let contenidoTabla = '';
    if (userTransactions.length === 0) {
        contenidoTabla = `<tr><td colspan="5" style="text-align:center; padding: 30px;">No hay transacciones registradas.</td></tr>`;
    } else {
        userTransactions.forEach(tx => {
            contenidoTabla += `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${tx.fecha}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong>${tx.numeroReferencia}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
                        <span class="${tx.tipo === 'consignacion' ? 'consignacion' : 'retiro'}">${tx.tipo}</span>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${tx.concepto}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;" class="${tx.tipo === 'consignacion' ? 'positive' : 'negative'}">
                        ${tx.tipo === 'consignacion' ? '+' : '-'}$${Number(tx.valor).toLocaleString()}
                    </td>
                </tr>
            `;
        });
    }

    // Crear ventana de impresión con estilo mejorado
    const printWindow = window.open('', '_blank');
    
    // Fecha formateada
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const contenidoPDF = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Resumen de Transacciones - ${currentUser.nombres} ${currentUser.apellidos}</title>
            <style>
                @page { size: A4; margin: 2cm; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6;
                    color: #1e293b;
                    background: #fff;
                    margin: 0;
                    padding: 0 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    position: relative;
                }
                .header::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80%;
                    height: 3px;
                    background: linear-gradient(90deg, #1e3c72, #2a5298, #1e3c72);
                }
                .header h1 {
                    color: #1e3c72;
                    font-size: 28px;
                    margin: 0 0 15px;
                }
                .header h2 {
                    color: #2a5298;
                    font-size: 20px;
                    margin: 0 0 10px;
                    font-weight: 600;
                }
                .fecha {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 10px;
                }
                .account-info {
                    margin: 30px 0;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 10px;
                    border-left: 5px solid #2563eb;
                }
                .account-info p {
                    margin: 10px 0;
                }
                .summary {
                    background: #e0f2fe;
                    border-radius: 8px;
                    padding: 10px 15px;
                    margin: 25px 0;
                    color: #0c4a6e;
                    font-weight: 600;
                    text-align: center;
                    border: 1px solid #bae6fd;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                }
                th {
                    background: #e2e8f0;
                    color: #334155;
                    text-align: left;
                    padding: 15px 12px;
                    font-weight: 700;
                    border-top: 2px solid #cbd5e1;
                    border-bottom: 2px solid #cbd5e1;
                }
                td {
                    padding: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                tr:nth-child(even) {
                    background-color: #f8fafc;
                }
                .consignacion {
                    color: #16a34a;
                    font-weight: 600;
                }
                .retiro {
                    color: #dc2626;
                    font-weight: 600;
                }
                .positive { 
                    color: #16a34a;
                }
                .negative { 
                    color: #dc2626;
                }
                .footer {
                    margin-top: 50px;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #64748b;
                }
                .watermark {
                    position: fixed;
                    bottom: 3cm;
                    right: 3cm;
                    transform: rotate(-45deg);
                    font-size: 80px;
                    color: rgba(200, 200, 200, 0.1);
                    z-index: -1;
                }
            </style>
        </head>
        <body>
            <div class="watermark">BANCO DIGITAL</div>
            <div class="header">
                <h1>BANCO DIGITAL</h1>
                <h2>RESUMEN DE TRANSACCIONES</h2>
                <div class="fecha">Generado el: ${fechaActual}</div>
            </div>
            
            <div class="account-info">
                <p><strong>Número de Cuenta:</strong> ${currentUser.numeroCuenta}</p>
                <p><strong>Titular:</strong> ${currentUser.nombres} ${currentUser.apellidos}</p>
                <p><strong>Saldo Actual:</strong> $${saldoActual.toLocaleString()}</p>
            </div>
            
            <div class="summary">
                <p>Últimas 10 Transacciones</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Referencia</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Concepto</th>
                        <th scope="col">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${contenidoTabla}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Este documento es informativo y no constituye un estado de cuenta oficial.</p>
                <p>Banco Digital © ${new Date().getFullYear()} | Tel: (601) 123-4567 | bancodigital@ejemplo.com</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(contenidoPDF);
    printWindow.document.close();
    
    // Esperar a que cargue el contenido antes de imprimir
    printWindow.onload = function() {
        printWindow.print();
        // No cerramos la ventana automáticamente para que el usuario pueda descargar el PDF
    };
}

// Actualizar tabla de transacciones con las últimas operaciones
function updateTransactionsTable() {
    // Obtener transacciones del usuario desde la BD
    let db = JSON.parse(localStorage.getItem('db') || '{"users":[]}');
    const idx = db.users.findIndex(u => u.numeroCuenta === currentUser.numeroCuenta);
    let userTransactions = [];
    
    if (idx !== -1 && Array.isArray(db.users[idx].transacciones)) {
        userTransactions = db.users[idx].transacciones
            .slice()
            .sort((a, b) => {
                // Convertir fechas para ordenar correctamente (más reciente primero)
                return new Date(b.fecha) - new Date(a.fecha);
            })
            .slice(0, 10); // Mostrar solo las últimas 10
    }

    const tbody = document.querySelector('#transacciones tbody');
    if (tbody) {
        tbody.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            tbody.innerHTML = '';
            
            if (userTransactions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No hay transacciones registradas</td></tr>';
            } else {
                userTransactions.forEach((trans, index) => {
                    const row = document.createElement('tr');
                    row.style.opacity = '0';
                    row.style.transform = 'translateY(20px)';
                    
                    row.innerHTML = `
                        <td>${trans.fecha}</td>
                        <td><strong>${trans.numeroReferencia || ''}</strong></td>
                        <td><span class="transaction-type ${trans.tipo}">${trans.tipo}</span></td>
                        <td>${trans.concepto || ''}</td>
                        <td class="${trans.tipo === 'consignacion' ? 'positive' : 'negative'}" style="text-align: right; font-weight: 700;">
                            ${trans.tipo === 'consignacion' ? '+' : '-'}$${Number(trans.valor).toLocaleString()}
                        </td>
                    `;
                    
                    tbody.appendChild(row);
                    
                    // Animar cada fila con un pequeño retraso para efecto cascada
                    setTimeout(() => {
                        row.style.animation = 'slideInUp 0.4s ease-out forwards';
                    }, index * 50);
                });
            }
            
            tbody.style.animation = 'fadeIn 0.5s ease-out';
        }, 300);
    }
}

// Función para mostrar el modal de eliminar cuenta
function showDeleteAccountModal() {
    // Crear el modal dinámicamente
    const modal = document.createElement('div');
    modal.id = 'deleteAccountModal';
    modal.className = 'modal';
    modal.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            border-radius: 8px;
            padding: 20px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            animation: slideInUp 0.4s ease-out;
        ">
            <h2 style="color: #dc2626; text-align: center;">Eliminar Cuenta</h2>
            <p style="
                margin: 15px 0;
                text-align: center;
                color: #333;
                font-size: 16px;
            ">
                ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y se perderán todos los datos asociados.
            </p>
            <div style="
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
            ">
                <button id="cancelDeleteBtn" class="btn" style="
                    background: #e2e8f0;
                    color: #334155;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    flex: 1;
                    margin-right: 10px;
                    transition: background 0.3s;
                ">
                    Cancelar
                </button>
                <button id="confirmDeleteBtn" class="btn" style="
                    background: #dc2626;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    flex: 1;
                    margin-left: 10px;
                    transition: background 0.3s;
                ">
                    Eliminar Cuenta
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Función para cerrar el modal
    function closeModal() {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Evento para el botón de cancelar
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeModal);
    
    // Evento para el botón de confirmar eliminación
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        this.disabled = true;
        this.innerHTML = '<span class="loading-spinner"></span> Eliminando...';
        
        // Simular proceso de eliminación
        setTimeout(() => {
            deleteUserAccount();
        }, 1500);
    });
}

// Función para eliminar la cuenta de usuario
function deleteUserAccount() {
    if (!currentUser) {
        showErrorNotification('No hay una sesión de usuario activa');
        return;
    }
    
    try {
        // Obtener la base de datos
        let db = JSON.parse(localStorage.getItem('db') || '{"users":[]}');
        
        // Verificar que la estructura es correcta
        if (!db || !Array.isArray(db.users)) {
            throw new Error('Estructura de base de datos incorrecta');
        }
        
        // Encontrar el índice del usuario exacto por numeroCuenta
        const userIndex = db.users.findIndex(u => u.numeroCuenta === currentUser.numeroCuenta);
        console.log('Eliminando usuario:', currentUser.numeroCuenta, 'Índice:', userIndex);
        
        if (userIndex !== -1) {
            // Eliminar el usuario del array
            db.users.splice(userIndex, 1);
            
            // Guardar la base de datos actualizada
            localStorage.setItem('db', JSON.stringify(db));
            
            // Eliminar datos de sesión
            localStorage.removeItem('currentUser');
            localStorage.removeItem('lastActivity');
            
            // Mostrar notificación de éxito
            showNotification('Tu cuenta ha sido eliminada exitosamente');
            
            // Cerrar modal si existe
            const modal = document.getElementById('deleteAccountModal');
            if (modal) {
                modal.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
            
            // Redirigir a la página de inicio
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            throw new Error('Usuario no encontrado en la base de datos');
        }
    } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        showErrorNotification('Ha ocurrido un error al eliminar tu cuenta. Intenta nuevamente.');
        
        // Restaurar botón de confirmación
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = 'Eliminar Cuenta';
        }
    }
}

// Guardar transacción en la base de datos
function saveTransaction(tipo, concepto, valor, referencia) {
    const transaction = {
        id: Date.now().toString(),
        fecha: new Date().toLocaleDateString(),
        numeroReferencia: referencia.toString(),
        tipo: tipo,
        concepto: concepto,
        valor: valor
    };

    // Guardar la transacción solo en el usuario
    let db = JSON.parse(localStorage.getItem('db') || '{"users":[]}');
    const idx = db.users.findIndex(u => u.numeroCuenta === currentUser.numeroCuenta);
    if (idx !== -1) {
        if (!Array.isArray(db.users[idx].transacciones)) {
            db.users[idx].transacciones = [];
        }
        // Guardar transacción con la misma estructura
        db.users[idx].transacciones.push({...transaction});
        localStorage.setItem('db', JSON.stringify(db));
    }

    // Actualizar tabla con animación
    setTimeout(() => updateTransactionsTable(), 500);
}

// Actualizar el saldo del usuario en la base de datos
function updateUserSaldoInDB(nuevoSaldo) {
    let db = JSON.parse(localStorage.getItem('db') || '{"users":[]}');
    const idx = db.users.findIndex(u => u.numeroCuenta === currentUser.numeroCuenta);
    if (idx !== -1) {
        db.users[idx].saldo = nuevoSaldo;
        localStorage.setItem('db', JSON.stringify(db));
        
        // Actualizar también en la sesión actual
        currentUser.saldo = nuevoSaldo;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Mostrar animación de cambio de saldo
function animateBalanceChange(oldValue, newValue) {
    const saldoElement = document.querySelector('.account-info .info-item:nth-child(2) .value');
    if (!saldoElement) return;
    
    // Guardar texto original
    const originalText = saldoElement.textContent;
    
    // Crear capa de animación
    const animationLayer = document.createElement('div');
    animationLayer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5em;
        font-weight: bold;
        color: ${newValue > oldValue ? '#16a34a' : '#dc2626'};
        animation: pulse 1s ease-out;
        pointer-events: none;
    `;
    
    animationLayer.textContent = `${newValue > oldValue ? '+' : '-'}$${Math.abs(newValue - oldValue).toLocaleString()}`;
    
    saldoElement.style.position = 'relative';
    saldoElement.appendChild(animationLayer);
    
    setTimeout(() => {
        animationLayer.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => animationLayer.remove(), 500);
    }, 1500);
}

// Mostrar animación de botón cargando
function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<span class="loading-spinner"></span> Procesando...`;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || 'Enviar';
        delete button.dataset.originalText;
    }
}

// Añade estos estilos si no existen ya
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes slideInUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideOutDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(50px); opacity: 0; }
    }
`;
document.head.appendChild(modalStyle);

// Event listeners para los botones del modal de eliminar cuenta
document.addEventListener('DOMContentLoaded', function() {
    // Botón para mostrar el modal
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            const modal = document.getElementById('deleteAccountModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.style.animation = 'fadeIn 0.3s ease-out';
            }
        });
    }
    
    // Botón para cancelar eliminación
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            const modal = document.getElementById('deleteAccountModal');
            if (modal) {
                modal.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // Botón para confirmar eliminación
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            this.disabled = true;
            this.innerHTML = '<span class="loading-spinner"></span> Eliminando...';
            
            // Proceso de eliminación
            setTimeout(() => {
                deleteUserAccount();
            }, 1500);
        });
    }
});

// Finalizado
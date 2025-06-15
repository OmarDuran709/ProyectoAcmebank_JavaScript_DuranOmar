// Variables globales
let currentUser = null;
let saldoActual = 2500000;
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
            element.innerHTML = `
                <p><strong>Número de Cuenta:</strong> ${currentUser.numeroCuenta}</p>
                <p><strong>Titular:</strong> ${currentUser.nombres} ${currentUser.apellidos}</p>
                <p><strong>Saldo Disponible:</strong> $${saldoActual.toLocaleString()}</p>
            `;
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

// Configurar event listeners para formularios
function setupFormListeners() {
    // Consignación con animaciones
    const consignacionForm = document.getElementById('consignacionForm');
    if (consignacionForm) {
        consignacionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const valor = parseFloat(document.getElementById('valorConsignacion').value);
            
            if (valor <= 0) {
                showMessage('consignacionMessage', 'error', 'Ingrese un valor válido');
                return;
            }
            
            // Animación de loading
            setButtonLoading(submitButton, true);
            
            // Simular procesamiento
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const referencia = generateReference();
            
            // Actualizar saldo con animación
            const oldSaldo = saldoActual;
            saldoActual += valor;
            updateUserSaldoInDB(saldoActual);
            updateAccountInfo();
            
            // Guardar transacción
            saveTransaction('consignacion', 'Consignación por canal electrónico', valor, referencia);
            
            // Mostrar mensaje de éxito
            showMessage('consignacionMessage', 'success', 
                `✓ Consignación realizada exitosamente<br>
                <strong>Referencia:</strong> ${referencia}<br>
                <strong>Valor:</strong> $${valor.toLocaleString()}`);
            
            // Mostrar notificación
            showNotification(`Consignación de $${valor.toLocaleString()} realizada exitosamente`);
            
            // Reset form
            this.reset();
            setButtonLoading(submitButton, false);
            
            // Animar cambio de saldo
            animateBalanceChange(oldSaldo, saldoActual);
        });
    }

    // Retiro con animaciones
    const retiroForm = document.getElementById('retiroForm');
    if (retiroForm) {
        retiroForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const valor = parseFloat(document.getElementById('valorRetiro').value);
            
            if (valor <= 0) {
                showMessage('retiroMessage', 'error', 'Ingrese un valor válido');
                return;
            }
            
            // Antes de restar saldo en retiro o pago de servicios:
            if (valor > saldoActual) {
                showMessage('retiroMessage', 'error', '⚠ Saldo insuficiente para realizar esta operación');
                setButtonLoading(submitButton, false); // <-- Esto es clave
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
        });
    }

    // Pago de servicios con animaciones
    const serviciosForm = document.getElementById('serviciosForm');
    if (serviciosForm) {
        serviciosForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const servicio = document.getElementById('servicio').value;
            const valor = parseFloat(document.getElementById('valorServicio').value);
            
            if (!servicio || valor <= 0) {
                showMessage('serviciosMessage', 'error', 'Complete todos los campos correctamente');
                return;
            }
            
            // Antes de restar saldo en retiro o pago de servicios:
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
        });
    }
}

// Animar cambio de saldo
function animateBalanceChange(oldValue, newValue) {
    const saldoElement = document.getElementById('saldoCounter');
    if (saldoElement) {
        // Efecto de pulso
        saldoElement.style.animation = 'pulse 0.6s ease-out';
        setTimeout(() => {
            animateCounter('saldoCounter', oldValue, newValue, 1000, '$');
        }, 300);
    }
}

// Configurar estado de loading en botones
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        if (!button.getAttribute('data-original-text')) {
            button.setAttribute('data-original-text', button.innerHTML);
        }
        button.disabled = true;
        button.innerHTML = `
            <span class="loading-spinner"></span>
            Procesando...
        `;
        button.style.opacity = '0.8';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || 'Procesar';
        button.style.opacity = '1';
    }
}

// Guardar transacción
function saveTransaction(tipo, concepto, valor, referencia) {
    const transaction = {
        id: Date.now().toString(),
        fecha: new Date().toLocaleDateString(),
        numeroReferencia: referencia.toString(),
        tipo: tipo,
        concepto: concepto,
        valor: valor,
        numeroCuenta: currentUser.numeroCuenta
    };

    // Leer el objeto db completo
    let db = JSON.parse(localStorage.getItem('db'));
    if (!db.transactions) db.transactions = [];
    db.transactions.push(transaction);
    localStorage.setItem('db', JSON.stringify(db));

    // Actualizar tabla con animación
    setTimeout(() => updateTransactionsTable(), 500);
}

// Actualizar tabla de transacciones con animaciones
function updateTransactionsTable() {
    const db = JSON.parse(localStorage.getItem('db'));
    const transactions = db && db.transactions ? db.transactions : [];
    const userTransactions = transactions
        .filter(t => t.numeroCuenta === currentUser.numeroCuenta)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 10);
    
    const tbody = document.querySelector('#transacciones tbody');
    if (tbody) {
        // Animación de salida
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
                        <td><strong>${trans.numeroReferencia}</strong></td>
                        <td><span class="transaction-type ${trans.tipo}">${trans.tipo}</span></td>
                        <td>${trans.concepto}</td>
                        <td class="${trans.tipo === 'consignacion' ? 'positive' : 'negative'}" style="text-align: right; font-weight: 700;">
                            ${trans.tipo === 'consignacion' ? '+' : '-'}$${trans.valor.toLocaleString()}
                        </td>
                    `;
                    tbody.appendChild(row);
                    
                    // Animar entrada de fila
                    setTimeout(() => {
                        row.style.animation = 'slideInUp 0.4s ease-out forwards';
                    }, index * 50);
                });
            }
            
            tbody.style.animation = 'fadeIn 0.5s ease-out';
        }, 300);
    }
}

// Configurar botones de impresión mejorados
function setupPrintButtons() {
    const printButtons = document.querySelectorAll('.btn-primary');
    printButtons.forEach(button => {
        if (button.textContent.includes('Imprimir')) {
            button.addEventListener('click', function() {
                // Animación de click
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Determinar qué imprimir basado en la sección activa
                const activeSection = document.querySelector('.content-section.active');
                if (activeSection) {
                    const sectionId = activeSection.id;
                    let title = 'Documento Bancario';
                    
                    switch(sectionId) {
                        case 'transacciones':
                            title = 'Resumen de Transacciones';
                            break;
                        case 'extracto':
                            title = 'Extracto Bancario';
                            break;
                        case 'certificado':
                            title = 'Certificado Bancario';
                            break;
                    }
                    
                    printSectionWithAnimation(sectionId, title);
                }
            });
        }
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

// Actualizar fecha actual
function updateCurrentDate() {
    const fechaElement = document.getElementById('fechaActual');
    if (fechaElement) {
        fechaElement.textContent = new Date().toLocaleDateString();
    }
}

// Función para cerrar sesión con animación
function logout() {
    // Animación de salida
    const dashboard = document.querySelector('.dashboard-container');
    if (dashboard) {
        dashboard.style.animation = 'fadeOut 0.5s ease-out';
    }
    
    showNotification('Cerrando sesión...', 'success');
    
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }, 1000);
}

// Mostrar modal de confirmación para eliminar cuenta
function showDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (!modal) return;
    modal.style.display = 'flex';
    // Enfoca el botón cancelar para accesibilidad
    setTimeout(() => document.getElementById('cancelDeleteBtn').focus(), 100);
    // Cerrar modal con Escape
    function escListener(e) {
        if (e.key === 'Escape') closeModal();
    }
    function closeModal() {
        modal.style.display = 'none';
        document.removeEventListener('keydown', escListener);
    }
    document.getElementById('cancelDeleteBtn').onclick = closeModal;
    modal.onclick = function(e) {
        if (e.target === modal) closeModal();
    };
    document.addEventListener('keydown', escListener);

    document.getElementById('confirmDeleteBtn').onclick = function() {
        closeModal();
        eliminarCuentaUsuario();
    };
}

// Lógica real de eliminación
function eliminarCuentaUsuario() {
    if (!currentUser) return;
    let db = JSON.parse(localStorage.getItem('db'));
    db.users = db.users.filter(u => u.numeroCuenta !== currentUser.numeroCuenta);
    if (db.transactions) {
        db.transactions = db.transactions.filter(t => t.numeroCuenta !== currentUser.numeroCuenta);
    }
    localStorage.setItem('db', JSON.stringify(db));
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiration');
    showNotification('Cuenta eliminada exitosamente', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Asignar evento al botón al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', showDeleteAccountModal);
    }
});

// Agregar estilos CSS adicionales para animaciones
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
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
    
    .transaction-type {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .transaction-type.consignacion {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
    }
    
    .transaction-type.retiro {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
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
window.showSection = showSection;
window.logout = logout;

// Filtrar extracto por mes y año
function setupExtractoFilter() {
    const añoSelect = document.getElementById('año');
    const mesSelect = document.getElementById('mes');
    if (!añoSelect || !mesSelect) return;

    function updateExtractoTable() {
        const año = añoSelect.value;
        const mes = mesSelect.value;
        const db = JSON.parse(localStorage.getItem('db'));
        const transactions = db && db.transactions ? db.transactions : [];
        const userTransactions = transactions.filter(t => t.numeroCuenta === currentUser.numeroCuenta);

        // Filtrar por año y mes
        const filtered = userTransactions.filter(t => {
            // Suponiendo formato fecha: "dd/mm/yyyy"
            const [dia, mesT, añoT] = t.fecha.split('/');
            return añoT === año && parseInt(mesT) === parseInt(mes);
        });

        const tbody = document.querySelector('#extracto .transactions-table tbody');
        if (tbody) {
            tbody.innerHTML = '';
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No hay transacciones para este periodo</td></tr>';
            } else {
                filtered.forEach(trans => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${trans.fecha}</td>
                        <td><strong>${trans.numeroReferencia}</strong></td>
                        <td>${trans.tipo.charAt(0).toUpperCase() + trans.tipo.slice(1)}</td>
                        <td>${trans.concepto}</td>
                        <td class="${trans.tipo === 'consignacion' ? 'positive' : 'negative'}" style="text-align: right; font-weight: 700;">
                            ${trans.tipo === 'consignacion' ? '+' : '-'}$${trans.valor.toLocaleString()}
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    }

    añoSelect.addEventListener('change', updateExtractoTable);
    mesSelect.addEventListener('change', updateExtractoTable);

    // Llamar al cargar la página
    updateExtractoTable();
}

// Configurar opciones de año y mes para el extracto
function setupExtractoYearMonthOptions() {
    const añoSelect = document.getElementById('año');
    const mesSelect = document.getElementById('mes');
    if (!añoSelect || !mesSelect) return;

    // Obtener todas las transacciones del usuario
    const db = JSON.parse(localStorage.getItem('db'));
    const transactions = db && db.transactions ? db.transactions : [];
    const userTransactions = transactions.filter(t => t.numeroCuenta === currentUser.numeroCuenta);

    // Buscar año más antiguo y año actual
    let minYear = new Date().getFullYear();
    userTransactions.forEach(t => {
        if (t.fecha) {
            // Suponiendo formato fecha: "dd/mm/yyyy"
            const partes = t.fecha.split('/');
            if (partes.length === 3) {
                const añoT = parseInt(partes[2]);
                if (añoT < minYear) minYear = añoT;
            }
        }
    });
    const now = new Date();
    const maxYear = now.getFullYear();

    // Limpiar y llenar opciones de año
    añoSelect.innerHTML = '';
    for (let y = maxYear; y >= minYear; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        añoSelect.appendChild(opt);
    }

    // Limpiar y llenar opciones de mes (hasta el mes actual si es el año actual)
    function updateMesOptions() {
        const selectedYear = parseInt(añoSelect.value);
        let maxMonth = 12;
        if (selectedYear === maxYear) {
            maxMonth = now.getMonth() + 1; // getMonth es 0-indexado
        }
        mesSelect.innerHTML = '';
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
        // Selecciona el mes actual por defecto si es el año actual
        if (selectedYear === maxYear) {
            mesSelect.value = now.getMonth() + 1;
        }
    }

    añoSelect.addEventListener('change', updateMesOptions);
    updateMesOptions();
}

// Actualizar saldo en la base de datos
function updateUserSaldoInDB(nuevoSaldo) {
    let db = JSON.parse(localStorage.getItem('db'));
    const idx = db.users.findIndex(u => u.numeroCuenta === currentUser.numeroCuenta);
    if (idx !== -1) {
        db.users[idx].saldo = nuevoSaldo;
        localStorage.setItem('db', JSON.stringify(db));
        // También actualiza el currentUser en localStorage
        currentUser.saldo = nuevoSaldo;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Verificar expiración de sesión
function checkSessionExpiration() {
    const expiration = localStorage.getItem('sessionExpiration');
    if (!expiration || Date.now() > Number(expiration)) {
        // Limpiar sesión y redirigir a login
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionExpiration');
        window.location.href = 'login.html';
    }
}

// Refrescar expiración de sesión
function refreshSessionExpiration() {
    const sessionDuration = 30 * 60 * 1000;
    localStorage.setItem('sessionExpiration', Date.now() + sessionDuration);
}

// Llama a esta función en eventos como clics, movimientos, etc.
document.addEventListener('mousemove', refreshSessionExpiration);
document.addEventListener('keydown', refreshSessionExpiration);

// Sincronización entre pestañas: actualiza la UI si cambia el localStorage
window.addEventListener('storage', function(event) {
    if (event.key === 'db' || event.key === 'currentUser') {
        // Si el usuario fue eliminado o cerró sesión en otra pestaña
        if (!localStorage.getItem('currentUser')) {
            showNotification('Sesión cerrada o cuenta eliminada en otra pestaña.', 'error');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }
        // Si hay cambios en la base de datos, recarga la UI
        loadCurrentUser().then(() => {
            updateUserInterface();
            setupExtractoFilter();
            setupExtractoYearMonthOptions();
        });
    }
    // Si la sesión expiró en otra pestaña
    if (event.key === 'sessionExpiration') {
        const expiration = localStorage.getItem('sessionExpiration');
        if (!expiration || Date.now() > Number(expiration)) {
            showNotification('Sesión expirada en otra pestaña.', 'error');
            setTimeout(() => window.location.href = 'login.html', 2000);
        }
    }
});
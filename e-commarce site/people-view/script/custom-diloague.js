// Inject CSS globally so it works on all pages automatically
if (!document.getElementById('custom-dialog-style')) {
    const style = document.createElement('style');
    style.id = 'custom-dialog-style';
    style.textContent = `
        .custom-dialog {
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 12px;
            color: white;
            font-family: 'Poppins', sans-serif;
            font-size: 0.95rem;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            transition: opacity 0.4s ease, transform 0.4s ease;
            transform: translateY(-20px);
            opacity: 0;
            pointer-events: none;
        }
        .custom-dialog.show {
            transform: translateY(0);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Custom Dialogue Helper
 * @param {string} message - The message to display
 * @param {'success' | 'error' | 'warning' | 'alert' | 'info'} type - The type of alert
 */
function showMessage(message, type = 'info') {
    const dialog = document.createElement('div');
    dialog.className = `custom-dialog`;

    const colors = {
        success: '#059669', // Deep Emerald
        error: '#ef4444',   // Modern Rose
        warning: '#f59e0b', // Amber
        alert: '#dc2626',   // Strong Red
        info: '#818cf8'     // Midnight Indigo
    };

    dialog.style.backgroundColor = colors[type] || colors.info;
    dialog.innerText = message;
    document.body.appendChild(dialog);

    // Trigger animation
    setTimeout(() => dialog.classList.add('show'), 10);

    setTimeout(() => {
        dialog.classList.remove('show');
        setTimeout(() => dialog.remove(), 400);
    }, 3000);
}

// Example usage:
// showMessage("Firebase Connected!", "success");
document.addEventListener('DOMContentLoaded', () => {
    const footerContainer = document.getElementById('footer-placeholder');
    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer class="footer">
                <p>&copy; 2026 Baroda Shop1 | All rights reserved. | 
                Developed by : <a  class="link" href="https://firebase.google.com/">BCS Developer</a> 
                | made with &hearts; in Bangladesh | 
                Hosted by : <a href="https://hosting.bcsdevloper.web.app" target="_blank" class="link">Google Firebase</a></p>
            </footer>
        `;
    }
}); 
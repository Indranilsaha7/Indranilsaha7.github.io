document.addEventListener("DOMContentLoaded", () => {
    const footerPlaceholder = document.getElementById("footer-placeholder");

    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer class="shop-footer">
                <p>&copy; ${new Date().getFullYear()} Baroda Shop1. All rights reserved.</p>
                <p>Support: vendors@barodashop.com</p>
            </footer>
        `;
    }
});
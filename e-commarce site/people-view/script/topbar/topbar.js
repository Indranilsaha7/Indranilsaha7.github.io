import { auth } from '../../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const topbarPlaceholder = document.getElementById('topbar-placeholder');
    if (topbarPlaceholder) {
        topbarPlaceholder.innerHTML = `
            <header class="topbar">
                <div class="topbar-container">
                    <a href="index.html" class="logo">Baroda Shop1</a>
                    <nav class="nav-menu">
                        <ul class="nav-list">
                            <li><a href="index.html" class="nav-link">Home</a></li>
                            <li><a href="about-us.html" class="nav-link">About Us</a></li>
                            <li><a href="all-product.html" class="nav-link">Products</a></li>
                            <li><a href="cart.html" class="nav-link"><i class="fa-solid fa-cart-shopping"></i> Cart</a></li>
                            <li><a href="contact.html" class="nav-link">Contact</a></li>
                        </ul>
                        <div class="auth-buttons">
                            <a href="login.html" class="btn-auth">Login</a>
                            <a href="signin.html" class="btn-auth btn-primary">Sign Up</a>
                        </div>
                    </nav>
                    <div class="hamburger-menu">
                        <i class="fas fa-bars"></i>
                    </div>
                </div>
            </header>
            <div class="menu-backdrop"></div>
        `;

        // Add event listener for hamburger menu
        const hamburger = document.querySelector('.hamburger-menu');
        const navMenu = document.querySelector('.nav-menu');
        const backdrop = document.querySelector('.menu-backdrop');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                const isActive = navMenu.classList.toggle('active');
                hamburger.classList.toggle('active', isActive);
                const icon = hamburger.querySelector('i');
                
                if (isActive) {
                    icon.classList.remove('fa-bars', 'fa-times');
                    icon.classList.add('fa-xmark'); // Use correct FA 6 class
                } else {
                    icon.classList.remove('fa-xmark', 'fa-times');
                    icon.classList.add('fa-bars');
                }
                if (backdrop) backdrop.classList.toggle('active', isActive);
            });
            
            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                    const icon = hamburger.querySelector('i');
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark', 'fa-times');
                    backdrop.classList.remove('active');
                });
            }
        }

        // Check user auth state and update UI
        onAuthStateChanged(auth, (user) => {
            const authButtons = document.querySelector('.auth-buttons');
            if (!authButtons) return;

            if (user) {
                // User is signed in
                const isDashboard = window.location.pathname.includes('dashboard.html');
                authButtons.innerHTML = `
                    <a href="dashboard.html" class="btn-auth ${isDashboard ? 'active' : ''}" ${isDashboard ? 'style="pointer-events: none; opacity: 0.6;"' : ''}>Dashboard</a>
                    <button id="topbar-logout-btn" class="btn-auth btn-primary">Logout</button>
                `;
                document.getElementById('topbar-logout-btn').addEventListener('click', () => {
                    signOut(auth).then(() => {
                        window.location.href = 'login.html';
                    }).catch(console.error);
                });
            } else {
                // User is signed out
                authButtons.innerHTML = `
                    <a href="login.html" class="btn-auth">Login</a>
                    <a href="signin.html" class="btn-auth btn-primary">Sign Up</a>
                `;
            }
        });
    }
});
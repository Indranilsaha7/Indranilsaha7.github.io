document.addEventListener("DOMContentLoaded", () => {
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");

    if (sidebarPlaceholder) {
        sidebarPlaceholder.innerHTML = `
            <aside class="shop-sidebar">
                <div class="sidebar-header">
                    <h2>Shop Portal</h2>
                </div>
                <ul class="nav-links">
                    <li><a href="dashboard.html"><i class="fas fa-home"></i> Dashboard</a></li>
                    <li class="has-submenu">
                        <a href="#" class="submenu-toggle"><i class="fas fa-box"></i> Products <i class="fas fa-chevron-down submenu-icon" style="margin-left: auto; font-size: 0.8rem;"></i></a>
                        <ul class="submenu" style="display: none; list-style: none; padding: 0; background: transparent;">
                            <li><a href="all-product.html" style="padding-left: 50px; font-size: 0.9rem; padding-top: 10px; padding-bottom: 10px; display: block; color: inherit; text-decoration: none;"><i class="fas fa-circle" style="font-size: 0.4rem; margin-right: 8px;"></i> All Products</a></li>
                            <li><a href="add-product.html" style="padding-left: 50px; font-size: 0.9rem; padding-top: 10px; padding-bottom: 10px; display: block; color: inherit; text-decoration: none;"><i class="fas fa-circle" style="font-size: 0.4rem; margin-right: 8px;"></i> Add Product</a></li>
                        </ul>
                    </li>
                    <li class="has-submenu">
                        <a href="#" class="submenu-toggle"><i class="fas fa-shopping-cart"></i> Purchases <i class="fas fa-chevron-down submenu-icon" style="margin-left: auto; font-size: 0.8rem;"></i></a>
                        <ul class="submenu" style="display: none; list-style: none; padding: 0; background: transparent;">
                            <li><a href="add-purchase.html" style="padding-left: 50px; font-size: 0.9rem; padding-top: 10px; padding-bottom: 10px; display: block; color: inherit; text-decoration: none;"><i class="fas fa-circle" style="font-size: 0.4rem; margin-right: 8px;"></i> Add Purchase</a></li>
                        </ul>
                    </li>
                    <li class="has-submenu">
                        <a href="#" class="submenu-toggle"><i class="fas fa-truck"></i> Suppliers <i class="fas fa-chevron-down submenu-icon" style="margin-left: auto; font-size: 0.8rem;"></i></a>
                        <ul class="submenu" style="display: none; list-style: none; padding: 0; background: transparent;">
                            <li><a href="add-supplier.html" style="padding-left: 50px; font-size: 0.9rem; padding-top: 10px; padding-bottom: 10px; display: block; color: inherit; text-decoration: none;"><i class="fas fa-circle" style="font-size: 0.4rem; margin-right: 8px;"></i> Add Supplier</a></li>
                        </ul>
                    </li>
                </ul>
            </aside>
            <div class="theme-toggle-wrapper" style="position: fixed; bottom: 20px; right: 20px; padding: 0.8rem 1.2rem; display: flex; align-items: center; gap: 15px; background-color: var(--topbar-bg, #ffffff); border: 1px solid var(--sidebar-border, #e5e7eb); border-radius: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;">
                <span style="font-size: 0.9rem; font-weight: 500;"><i class="fas fa-moon"></i> Dark Mode</span>
                <label class="theme-switch">
                    <input type="checkbox" id="theme-slider">
                    <span class="slider round"></span>
                </label>
            </div>
        `;

        // Submenu toggle functionality
        const submenuToggles = document.querySelectorAll('.submenu-toggle');
        submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const submenu = toggle.nextElementSibling;
                const icon = toggle.querySelector('.submenu-icon');

                if (submenu.style.display === 'none') {
                    submenu.style.display = 'block';
                    if (icon) icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    submenu.style.display = 'none';
                    if (icon) icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            });
        });

        // Dynamically highlight the active navigation link
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links li');
        let isAnyActive = false;

        navLinks.forEach(li => {
            const a = li.querySelector('a');
            if (a && currentPath.includes(a.getAttribute('href')) && a.getAttribute('href') !== '#') {
                li.classList.add('active');
                isAnyActive = true;

                // If the active link is inside a submenu, expand the submenu automatically
                const parentSubmenu = li.closest('.submenu');
                if (parentSubmenu) {
                    parentSubmenu.style.display = 'block';
                    const toggleIcon = parentSubmenu.previousElementSibling.querySelector('.submenu-icon');
                    if (toggleIcon) {
                        toggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    }
                }
            }
        });

        if (!isAnyActive && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
            const dashboardLink = document.querySelector('.nav-links a[href="dashboard.html"]');
            if (dashboardLink) {
                dashboardLink.parentElement.classList.add('active');
            }
        }

        // Theme Toggle Functionality
        const themeSlider = document.getElementById('theme-slider');
        const currentTheme = localStorage.getItem('shop-theme');

        // Load saved theme preference
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme);
            if (currentTheme === 'dark') {
                themeSlider.checked = true;
            }
        }

        // Listen for slider changes
        if (themeSlider) {
            themeSlider.addEventListener('change', (e) => {
                const newTheme = e.target.checked ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('shop-theme', newTheme);
            });
        }
    }
});
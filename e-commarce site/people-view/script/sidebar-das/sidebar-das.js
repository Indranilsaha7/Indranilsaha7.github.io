/**
 * Initializes the sidebar tab navigation for the Dashboard.
 */
export function initSidebar() {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    
    // Dynamically inject the sidebar HTML if the placeholder exists
    if (sidebarPlaceholder) {
        sidebarPlaceholder.innerHTML = `
            <aside class="dashboard-sidebar">
                <a href="dashboard.html" class="tab-btn" id="btn-tab-overview"><i class="fas fa-home"></i> Overview</a>
                <a href="recent-orders.html" class="tab-btn" id="btn-tab-orders"><i class="fas fa-box"></i> Recent Orders</a>
                <a href="wishlist.html" class="tab-btn" id="btn-tab-wishlist"><i class="fas fa-heart"></i> Wishlist</a>
                <a href="account-settings.html" class="tab-btn" id="btn-tab-settings"><i class="fas fa-cog"></i> Account Settings</a>
                <div id="logout-btn" class="logout-btn-sidebar"><i class="fas fa-sign-out-alt"></i> Logout</div>
            </aside>
        `;
    }

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    // Apply the active class based on current URL context
    if (currentPath === 'recent-orders.html') {
        document.getElementById('btn-tab-orders')?.classList.add('active');
    } else if (currentPath === 'wishlist.html') {
        document.getElementById('btn-tab-wishlist')?.classList.add('active');
    } else if (currentPath === 'account-settings.html') {
        document.getElementById('btn-tab-settings')?.classList.add('active');
    } else {
        document.getElementById('btn-tab-overview')?.classList.add('active');
    }
}
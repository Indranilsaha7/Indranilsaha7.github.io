document.addEventListener("DOMContentLoaded", () => {
    const topbarPlaceholder = document.getElementById("topbar-placeholder");
    
    if (topbarPlaceholder) {
        topbarPlaceholder.innerHTML = `
            <header class="topbar">
                <div class="topbar-left">
                    <i class="fas fa-bars topbar-icon" id="mobile-menu-btn"></i>
                    <h2 class="page-title" style="margin: 0; font-size: 1.2rem; color: #1f2937;">Welcome, <span id="shop-name-display">Shop Owner</span></h2>
                </div>
                <div class="topbar-right">
                    <div class="topbar-profile">
                        <img src="https://ui-avatars.com/api/?name=Shop+Owner&background=e0e7ff&color=3730a3" alt="Profile" class="topbar-profile-img" id="profile-img">
                    </div>
                    <i class="fas fa-sign-out-alt topbar-icon" id="logout-btn" title="Logout" style="margin-left: 10px;"></i>
                </div>
            </header>
        `;

        const shopName = sessionStorage.getItem('shopName');
        if (shopName) {
            document.getElementById('shop-name-display').innerText = shopName;
            const profileImg = document.getElementById('profile-img');
            if (profileImg) {
                profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(shopName)}&background=e0e7ff&color=3730a3`;
            }
        }

        document.getElementById('logout-btn').addEventListener('click', () => {
            sessionStorage.removeItem('shopAuthenticated');
            sessionStorage.removeItem('shopId');
            window.location.replace('login.html');
        });
    }
});
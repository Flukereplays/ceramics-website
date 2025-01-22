export class Auth {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.init();
    }

    init() {
        this.updateAdminAccess();
        this.updateLoginButton();
    }

    login(email, password) {
        // Admin credentials
        if (email === 'from.fire.ceramics@gmail.com' && password === 'from.fire') {
            this.user = {
                email: email,
                name: 'From Fire Ceramics',
                isAdmin: true
            };
            localStorage.setItem('currentUser', JSON.stringify(this.user));
            this.updateAdminAccess();
            this.updateLoginButton();
            this.hideLoginModal();
            this.showNotification('Logged in successfully!');
            return true;
        }
        this.showNotification('Invalid credentials', 'error');
        return false;
    }

    logout() {
        this.user = null;
        localStorage.removeItem('currentUser');
        this.updateAdminAccess();
        this.updateLoginButton();
        this.showNotification('Logged out successfully!');
    }

    updateAdminAccess() {
        const adminLink = document.querySelector('.admin-link');
        const adminSection = document.getElementById('admin');
        
        if (adminLink) {
            adminLink.style.display = this.user?.isAdmin ? 'inline-block' : 'none';
        }
        
        if (adminSection) {
            adminSection.style.display = this.user?.isAdmin ? 'block' : 'none';
        }
    }

    updateLoginButton() {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = this.user 
                ? `<i class="fas fa-sign-out-alt" onclick="auth.logout()"></i>`
                : `<i class="fas fa-user"></i>`;
            loginBtn.onclick = this.user ? null : () => this.showLoginModal();
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
            // Clear form
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialize auth functionality
const auth = new Auth();
export default auth;

// Expose to window for HTML event handlers
window.auth = auth; 
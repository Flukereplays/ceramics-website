export class Auth {
    constructor() {
        this.user = null;
    }

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
            this.user = foundUser;
            localStorage.setItem('currentUser', JSON.stringify(this.user));
            this.showAccountMenu();
            return true;
        }
        return false;
    }

    register(name, email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            return false;
        }

        const newUser = { name, email, password, orders: [] };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.user = newUser;
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        this.showAccountMenu();
        return true;
    }

    logout() {
        this.user = null;
        localStorage.removeItem('currentUser');
        this.showLoginForm();
    }

    showLoginForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const accountMenu = document.getElementById('account-menu');

        registerForm.style.display = 'none';
        accountMenu.style.display = 'none';
        loginForm.style.display = 'block';

        setTimeout(() => {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            accountMenu.classList.remove('active');
        }, 50);
    }

    showRegisterForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const accountMenu = document.getElementById('account-menu');

        loginForm.style.display = 'none';
        accountMenu.style.display = 'none';
        registerForm.style.display = 'block';

        setTimeout(() => {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
            accountMenu.classList.remove('active');
        }, 50);
    }

    showAccountMenu() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const accountMenu = document.getElementById('account-menu');

        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        accountMenu.style.display = 'block';
        document.getElementById('user-name').textContent = this.user.name;

        setTimeout(() => {
            accountMenu.classList.add('active');
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');
        }, 50);

        this.displayOrders();
    }

    displayOrders() {
        const ordersList = document.getElementById('orders-list');
        if (this.user && this.user.orders) {
            ordersList.innerHTML = this.user.orders.map(order => `
                <div class="order-item">
                    <p>Order Date: ${new Date(order.date).toLocaleDateString()}</p>
                    <p>Total: ${order.total}</p>
                    <p>Status: ${order.status}</p>
                </div>
            `).join('');
        }
    }
} 
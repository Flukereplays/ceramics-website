import { formatCurrency } from './utils.js';

export class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
    }

    addItem(product) {
        if (!product.id) {
            product.id = Date.now().toString();
        }

        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }

        this.updateDisplay();
        this.saveCart();
        this.showToast(`${product.name} added to cart!`);
    }

    updateQuantity(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.items = this.items.filter(i => i.id !== productId);
            }
            this.updateDisplay();
            this.saveCart();
        }
    }

    updateDisplay() {
        const cartItems = document.querySelector('.cart-items');
        const cartCount = document.querySelector('.cart-count');
        
        cartCount.textContent = this.items.reduce((total, item) => total + item.quantity, 0);

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${formatCurrency(item.price)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cart-total-amount').textContent = formatCurrency(this.total);
    }

    saveCart() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            localStorage.setItem(`cart_${user.email}`, JSON.stringify(this.items));
        }
    }

    loadCart() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            this.items = JSON.parse(localStorage.getItem(`cart_${user.email}`) || '[]');
            this.updateDisplay();
        }
    }

    showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="${type}-icon">${type === 'success' ? '✓' : '⚠'}</span>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    checkout() {
        if (this.items.length === 0) {
            this.showToast('Your cart is empty', 'error');
            return;
        }

        const order = {
            date: new Date(),
            items: [...this.items],
            total: this.total,
            status: 'Processing'
        };

        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === user.email);
            if (!users[userIndex].orders) users[userIndex].orders = [];
            users[userIndex].orders.push(order);
            localStorage.setItem('users', JSON.stringify(users));

            this.items = [];
            this.saveCart();
            this.updateDisplay();
            this.showToast('Order placed successfully!');
        }
    }
} 
import { formatCurrency } from './utils.js';

export class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart') || '[]');
        this.isPanelVisible = false;
        this.init();
    }

    init() {
        this.createCartPanel();
        this.updateCartCount();
    }

    createCartPanel() {
        const cartPanel = document.createElement('div');
        cartPanel.className = 'cart-panel';
        cartPanel.innerHTML = `
            <div class="panel-header">
                <h3>Shopping Cart</h3>
                <button class="close-panel" onclick="cart.togglePanel()">&times;</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-total">
                <span>Total:</span>
                <span class="total-amount">$0.00</span>
            </div>
            <button class="checkout-btn" onclick="cart.checkout()">Checkout</button>
        `;
        document.body.appendChild(cartPanel);
        this.updateCartDisplay();
    }

    togglePanel() {
        const panel = document.querySelector('.cart-panel');
        this.isPanelVisible = !this.isPanelVisible;
        panel.classList.toggle('active', this.isPanelVisible);
    }

    addItem(productId) {
        const product = this.getProductDetails(productId);
        if (!product) return;

        const existingItem = this.items.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Item added to cart');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    getProductDetails(productId) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        return products.find(p => p.id === productId);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    updateCartCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        const countElement = document.querySelector('.cart-count');
        if (countElement) {
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'block' : 'none';
        }
    }

    updateCartDisplay() {
        const cartItems = document.querySelector('.cart-items');
        const totalElement = document.querySelector('.total-amount');
        if (!cartItems || !totalElement) return;

        const selectedCurrency = localStorage.getItem('selectedCurrency') || 'PLN';
        const currencySymbol = selectedCurrency === 'EUR' ? '€' : 'zł';
        const priceKey = selectedCurrency === 'EUR' ? 'priceEUR' : 'pricePLN';

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-price">${currencySymbol}${item[priceKey].toFixed(2)}</div>
                    <div class="quantity-controls">
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="cart.removeItem('${item.id}')">&times;</button>
            </div>
        `).join('');

        const total = this.items.reduce((sum, item) => sum + (item[priceKey] * item.quantity), 0);
        totalElement.textContent = `${currencySymbol}${total.toFixed(2)}`;
    }

    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty');
            return;
        }

        // Here you would typically integrate with a payment processor
        alert('Checkout functionality will be implemented soon!');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
} 
export class Wishlist {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('wishlist') || '[]');
        this.isPanelVisible = false;
        this.init();
    }

    init() {
        this.createWishlistPanel();
        this.updateWishlistCount();
    }

    createWishlistPanel() {
        const wishlistPanel = document.createElement('div');
        wishlistPanel.className = 'wishlist-panel';
        wishlistPanel.innerHTML = `
            <div class="panel-header">
                <h3>Wishlist</h3>
                <button class="close-panel" onclick="wishlist.togglePanel()">&times;</button>
            </div>
            <div class="wishlist-items"></div>
        `;
        document.body.appendChild(wishlistPanel);
        this.updateWishlistDisplay();
    }

    togglePanel() {
        const panel = document.querySelector('.wishlist-panel');
        this.isPanelVisible = !this.isPanelVisible;
        panel.classList.toggle('active', this.isPanelVisible);
    }

    toggleItem(productId) {
        const index = this.items.indexOf(productId);
        if (index === -1) {
            this.items.push(productId);
            this.showNotification('Item added to wishlist');
        } else {
            this.items.splice(index, 1);
            this.showNotification('Item removed from wishlist');
        }
        this.saveWishlist();
        this.updateWishlistDisplay();
        
        // Update product card heart icon
        const heartIcon = document.querySelector(`[data-product-id="${productId}"] .wishlist-btn i`);
        if (heartIcon) {
            heartIcon.className = this.items.includes(productId) ? 'fas fa-heart' : 'far fa-heart';
        }
    }

    getProductDetails(productId) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        return products.find(p => p.id === productId);
    }

    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
        this.updateWishlistCount();
    }

    updateWishlistCount() {
        const countElement = document.querySelector('.wishlist-count');
        if (countElement) {
            countElement.textContent = this.items.length;
            countElement.style.display = this.items.length > 0 ? 'block' : 'none';
        }
    }

    updateWishlistDisplay() {
        const wishlistItems = document.querySelector('.wishlist-items');
        if (!wishlistItems) return;

        const selectedCurrency = localStorage.getItem('selectedCurrency') || 'PLN';
        const currencySymbol = selectedCurrency === 'EUR' ? '€' : 'zł';
        const priceKey = selectedCurrency === 'EUR' ? 'priceEUR' : 'pricePLN';

        const products = this.items.map(id => this.getProductDetails(id)).filter(Boolean);

        wishlistItems.innerHTML = products.map(product => `
            <div class="wishlist-item">
                <img src="${product.image}" alt="${product.name}">
                <div class="item-details">
                    <h4>${product.name}</h4>
                    <div class="item-price">${currencySymbol}${product[priceKey].toFixed(2)}</div>
                </div>
                <div class="item-actions">
                    <button class="add-to-cart" onclick="cart.addItem('${product.id}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="remove-item" onclick="wishlist.toggleItem('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
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

// Initialize wishlist functionality and export instance
const wishlist = new Wishlist();
export default wishlist;

// Also expose to window for HTML event handlers
window.wishlist = wishlist; 
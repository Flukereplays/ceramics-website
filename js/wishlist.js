export class Wishlist {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('wishlist') || '[]');
        this.init();
    }

    init() {
        // Create wishlist panel
        this.createWishlistPanel();
        // Update wishlist count
        this.updateWishlistCount();
    }

    createWishlistPanel() {
        const panel = document.createElement('div');
        panel.className = 'wishlist-panel';
        panel.innerHTML = `
            <span class="panel-close" onclick="wishlist.togglePanel()">&times;</span>
            <h2>My Wishlist</h2>
            <div class="wishlist-items"></div>
        `;
        document.body.appendChild(panel);
    }

    toggleWishlist(productId) {
        const index = this.items.indexOf(productId);
        const btn = document.querySelector(`.product[data-id="${productId}"] .wishlist-btn i`);
        
        if (index === -1) {
            // Add to wishlist
            this.items.push(productId);
            if (btn) {
                btn.classList.remove('far');
                btn.classList.add('fas');
            }
            this.showMessage('Added to wishlist!');
        } else {
            // Remove from wishlist
            this.items.splice(index, 1);
            if (btn) {
                btn.classList.remove('fas');
                btn.classList.add('far');
            }
            this.showMessage('Removed from wishlist!');
        }
        
        localStorage.setItem('wishlist', JSON.stringify(this.items));
        this.updateWishlistCount();
        this.updateWishlistPanel();
    }

    togglePanel() {
        const panel = document.querySelector('.wishlist-panel');
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            this.updateWishlistPanel();
        }
    }

    updateWishlistPanel() {
        const container = document.querySelector('.wishlist-items');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const selectedCurrency = localStorage.getItem('selectedCurrency') || 'PLN';
        
        if (this.items.length === 0) {
            container.innerHTML = '<p class="empty-wishlist">Your wishlist is empty</p>';
            return;
        }

        container.innerHTML = this.items.map(id => {
            const product = products.find(p => p.id === id);
            if (!product) return '';
            
            return `
                <div class="wishlist-item">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="wishlist-item-details">
                        <h3>${product.name}</h3>
                        <p class="price">
                            ${selectedCurrency === 'EUR' 
                                ? `€${product.priceEUR.toFixed(2)}`
                                : `${product.pricePLN.toFixed(2)} zł`
                            }
                        </p>
                    </div>
                    <div class="wishlist-item-actions">
                        <button onclick="cart.addItem('${product.id}')">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button onclick="wishlist.toggleWishlist('${product.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateWishlistCount() {
        const count = document.querySelector('.wishlist-count');
        if (count) {
            count.textContent = this.items.length;
        }
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'toast-message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.classList.add('show');
            setTimeout(() => {
                messageDiv.classList.remove('show');
                setTimeout(() => messageDiv.remove(), 300);
            }, 2000);
        }, 100);
    }
}

// Initialize wishlist functionality and export instance
const wishlist = new Wishlist();
export default wishlist;

// Also expose to window for HTML event handlers
window.wishlist = wishlist; 
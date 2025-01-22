import config from './config.js';

export class Admin {
    constructor() {
        this.products = [];
        this.reviews = [];
        this.isAdminPanelVisible = false;
        this.currentEditingProduct = null;
        this.currentEditingReview = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.loadProducts();
        this.loadReviews();
        this.checkAuthStatus();
        if (this.isAuthenticated) {
            this.createAdminIcon();
            this.createAdminPanel();
            this.attachEventListeners();
        }
        this.setupEventListeners();
    }

    checkAuthStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.isAuthenticated = currentUser.isAdmin || false;
    }

    loadProducts() {
        const storedProducts = localStorage.getItem('products');
        this.products = storedProducts ? JSON.parse(storedProducts) : [];
    }

    loadReviews() {
        const storedReviews = localStorage.getItem('reviews');
        this.reviews = storedReviews ? JSON.parse(storedReviews) : [];
    }

    createAdminIcon() {
        const adminIcon = document.createElement('div');
        adminIcon.className = 'admin-icon';
        adminIcon.innerHTML = '⚙️';
        adminIcon.style.position = 'fixed';
        adminIcon.style.bottom = '20px';
        adminIcon.style.right = '20px';
        adminIcon.style.zIndex = '1001';
        document.body.appendChild(adminIcon);

        adminIcon.addEventListener('click', () => this.toggleAdminPanel());
    }

    createAdminPanel() {
        const adminPanel = document.createElement('div');
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <div class="admin-header">
                <div class="admin-title">
                    <span class="admin-icon-title">⚙️</span>
                    <h2>Admin Dashboard</h2>
                </div>
                <button class="close-admin-panel" onclick="admin.toggleAdminPanel()">×</button>
            </div>
            <div class="admin-controls">
                <button onclick="admin.showSection('products')">
                    <i class="fas fa-box"></i>
                    Products
                </button>
                <button onclick="admin.showSection('reviews')">
                    <i class="fas fa-star"></i>
                    Reviews
                </button>
                <button onclick="admin.showSection('messages')">
                    <i class="fas fa-envelope"></i>
                    Messages
                </button>
                <button onclick="admin.showSection('users')">
                    <i class="fas fa-users"></i>
                    Users
                </button>
                <button onclick="admin.showSection('settings')">
                    <i class="fas fa-cog"></i>
                    Settings
                </button>
            </div>
            <div id="adminContent"></div>
        `;
        document.body.appendChild(adminPanel);
    }

    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isAdminPanelVisible) {
                this.toggleAdminPanel();
            }
        });

        document.addEventListener('click', (e) => {
            const adminPanel = document.querySelector('.admin-panel');
            const adminIcon = document.querySelector('.admin-icon');
            
            if (this.isAdminPanelVisible && 
                !adminPanel.contains(e.target) && 
                !adminIcon.contains(e.target)) {
                this.toggleAdminPanel();
            }
        });

        const adminPanel = document.querySelector('.admin-panel');
        adminPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggleAdminPanel() {
        if (!this.isAuthenticated) {
            this.showError('Access denied. Admin privileges required.');
            return;
        }
        const adminPanel = document.querySelector('.admin-panel');
        this.isAdminPanelVisible = !this.isAdminPanelVisible;
        adminPanel.classList.toggle('active', this.isAdminPanelVisible);
    }

    showSection(section) {
        const adminContent = document.getElementById('adminContent');
        switch (section) {
            case 'products':
                this.showProductsSection();
                break;
            case 'reviews':
                this.showReviewsSection();
                break;
            case 'messages':
                this.showMessagesSection();
                break;
            case 'users':
                this.showUsersSection();
                break;
            case 'settings':
                this.showSettingsSection();
                break;
        }
    }

    showProductsSection() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <h3>Products Management</h3>
            <button onclick="admin.showAddProductForm()">Add New Product</button>
            <div class="product-list">
                ${this.products.map(product => `
                    <div class="product-item">
                        <img src="${product.image}" alt="${product.name}">
                        <span>${product.name}</span>
                        <div class="product-actions">
                            <button onclick="admin.editProduct('${product.id}')">Edit</button>
                            <button onclick="admin.deleteProduct('${product.id}')">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showReviewsSection() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <h3>Reviews Management</h3>
            <button onclick="admin.showAddReviewForm()">Add New Review</button>
            <div class="review-list">
                ${this.reviews.map(review => `
                    <div class="review-item">
                        <p class="review-quote">${review.quote}</p>
                        <p class="review-author">- ${review.author}</p>
                        <div class="review-actions">
                            <button onclick="admin.editReview('${review.id}')">Edit</button>
                            <button onclick="admin.deleteReview('${review.id}')">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showMessagesSection() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <h3>Customer Messages</h3>
            <div class="message-list">
                <p>Message functionality coming soon...</p>
            </div>
        `;
    }

    showUsersSection() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <h3>User Management</h3>
            <div class="user-list">
                <p>User management functionality coming soon...</p>
            </div>
        `;
    }

    showSettingsSection() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <h3>Site Settings</h3>
            <div class="settings-form">
                <p>Site settings functionality coming soon...</p>
            </div>
        `;
    }

    showAddProductForm() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <h3>${this.currentEditingProduct ? 'Edit' : 'Add'} Product</h3>
            <form class="admin-form" onsubmit="admin.handleProductSubmit(event)">
                <input type="text" name="name" placeholder="Product Name" required 
                    value="${this.currentEditingProduct?.name || ''}">
                <div class="price-inputs">
                    <div class="price-group">
                        <label for="priceEUR">Price (EUR)</label>
                        <input type="number" id="priceEUR" name="priceEUR" placeholder="Price in EUR" step="0.01" required 
                            value="${this.currentEditingProduct?.priceEUR || ''}"
                            onchange="admin.updatePLNPrice(this.value)">
                    </div>
                    <div class="price-group">
                        <label for="pricePLN">Price (PLN)</label>
                        <input type="number" id="pricePLN" name="pricePLN" placeholder="Price in PLN" step="0.01" required 
                            value="${this.currentEditingProduct?.pricePLN || ''}"
                            onchange="admin.updateEURPrice(this.value)">
                    </div>
                </div>
                <select name="category" required>
                    <option value="">Select Category</option>
                    <option value="vase" ${this.currentEditingProduct?.category === 'vase' ? 'selected' : ''}>Vase</option>
                    <option value="mug" ${this.currentEditingProduct?.category === 'mug' ? 'selected' : ''}>Mug</option>
                    <option value="plate" ${this.currentEditingProduct?.category === 'plate' ? 'selected' : ''}>Plate</option>
                    <option value="bowl" ${this.currentEditingProduct?.category === 'bowl' ? 'selected' : ''}>Bowl</option>
                </select>
                <input type="text" name="material" placeholder="Material" required 
                    value="${this.currentEditingProduct?.material || ''}">
                <input type="text" name="color" placeholder="Color" required 
                    value="${this.currentEditingProduct?.color || ''}">
                <input type="url" name="image" placeholder="Image URL" required 
                    value="${this.currentEditingProduct?.image || ''}">
                <textarea name="description" placeholder="Product Description" required>${this.currentEditingProduct?.description || ''}</textarea>
                <button type="submit">${this.currentEditingProduct ? 'Update' : 'Add'} Product</button>
            </form>
        `;
    }

    showAddReviewForm() {
        const adminContent = document.getElementById('adminContent');
        adminContent.innerHTML = `
            <h3>${this.currentEditingReview ? 'Edit' : 'Add'} Review</h3>
            <form class="admin-form" onsubmit="admin.handleReviewSubmit(event)">
                <textarea name="quote" placeholder="Review Quote" required>${this.currentEditingReview?.quote || ''}</textarea>
                <input type="text" name="author" placeholder="Author Name" required 
                    value="${this.currentEditingReview?.author || ''}">
                <button type="submit">${this.currentEditingReview ? 'Update' : 'Add'} Review</button>
            </form>
        `;
    }

    updatePLNPrice(eurValue) {
        if (!eurValue) return;
        const exchangeRate = 4.32; // Example exchange rate EUR to PLN
        const plnInput = document.getElementById('pricePLN');
        plnInput.value = (parseFloat(eurValue) * exchangeRate).toFixed(2);
    }

    updateEURPrice(plnValue) {
        if (!plnValue) return;
        const exchangeRate = 4.32; // Example exchange rate EUR to PLN
        const eurInput = document.getElementById('priceEUR');
        eurInput.value = (parseFloat(plnValue) / exchangeRate).toFixed(2);
    }

    setupEventListeners() {
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', async (e) => await this.handleProductSubmit(e));
        }
    }

    async uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${config.API_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload image');
            }

            const data = await response.json();
            return data.imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image: ' + error.message);
        }
    }

    async handleProductSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const imageFile = formData.get('product-image');
            
            // First, upload the image
            const imageUrl = await this.uploadImage(imageFile);
            
            // Create product data
            const productData = {
                name: formData.get('product-name'),
                description: formData.get('product-description'),
                price: parseFloat(formData.get('product-price')),
                category: formData.get('product-category'),
                imageUrl: imageUrl,
                inStock: true
            };

            // Send product data to API
            const response = await fetch(`${config.API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            this.showNotification('Product added successfully!');
            event.target.reset();
            
            // Refresh products display
            window.fetchProducts();
            
        } catch (error) {
            console.error('Error adding product:', error);
            this.showNotification('Error: ' + error.message, 'error');
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

    handleReviewSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const reviewData = {
            id: this.currentEditingReview?.id || crypto.randomUUID(),
            quote: formData.get('quote'),
            author: formData.get('author')
        };

        if (this.currentEditingReview) {
            const index = this.reviews.findIndex(r => r.id === this.currentEditingReview.id);
            if (index !== -1) {
                this.reviews[index] = reviewData;
            }
        } else {
            this.reviews.push(reviewData);
        }

        this.saveReviews();
        this.showSuccessMessage(this.currentEditingReview ? 'Review updated successfully!' : 'Review added successfully!');
        this.currentEditingReview = null;
        this.showReviewsSection();
    }

    editProduct(productId) {
        this.currentEditingProduct = this.products.find(p => p.id === productId);
        this.showAddProductForm();
    }

    editReview(reviewId) {
        this.currentEditingReview = this.reviews.find(r => r.id === reviewId);
        this.showAddReviewForm();
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.showSuccessMessage('Product deleted successfully!');
            this.showProductsSection();
        }
    }

    deleteReview(reviewId) {
        if (confirm('Are you sure you want to delete this review?')) {
            this.reviews = this.reviews.filter(r => r.id !== reviewId);
            this.saveReviews();
            this.showSuccessMessage('Review deleted successfully!');
            this.showReviewsSection();
        }
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
        // Refresh products display
        const catalogueSection = document.querySelector('.catalogue');
        const selectedCurrency = localStorage.getItem('selectedCurrency') || 'PLN';
        
        if (catalogueSection) {
            catalogueSection.innerHTML = this.products.map(product => `
                <div class="product" 
                    data-id="${product.id}"
                    data-category="${product.category}" 
                    data-material="${product.material}" 
                    data-color="${product.color}" 
                    data-price-eur="${product.priceEUR}" 
                    data-price-pln="${product.pricePLN}">
                    <div class="product-actions">
                        <button class="wishlist-btn" onclick="wishlist.toggleWishlist('${product.id}')" title="Add to Wishlist">
                            <i class="${this.isInWishlist(product.id) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="description">${product.description}</p>
                    <div class="product-details">
                        <div class="info">
                            <p class="material-color">${product.material} | ${product.color}</p>
                            <p class="price">
                                ${selectedCurrency === 'EUR' 
                                    ? `<span class="price-eur">€${product.priceEUR.toFixed(2)}</span>`
                                    : `<span class="price-pln">${product.pricePLN.toFixed(2)} zł</span>`
                                }
                            </p>
                        </div>
                        <button class="add-to-cart" onclick="cart.addItem('${product.id}')">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    isInWishlist(productId) {
        const wishlistItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
        return wishlistItems.includes(productId);
    }

    saveReviews() {
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
        // Refresh reviews display if needed
        const reviewsSection = document.querySelector('.testimonial-grid');
        if (reviewsSection) {
            reviewsSection.innerHTML = this.reviews.map(review => `
                <div class="testimonial">
                    <div class="quote">${review.quote}</div>
                    <div class="author">- ${review.author}</div>
                </div>
            `).join('');
        }
    }

    showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.background = '#4CAF50';
        messageDiv.style.color = 'white';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '1003';
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    showError(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'error-message';
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.background = '#ff4444';
        messageDiv.style.color = 'white';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '1003';
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    async loadReviews() {
        try {
            const response = await fetch(`${config.API_URL}/api/reviews`);
            if (!response.ok) throw new Error('Failed to fetch reviews');

            const reviews = await response.json();
            this.displayReviews(reviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    displayReviews(reviews) {
        const reviewsList = document.getElementById('reviews-list');
        if (!reviewsList) return;

        reviewsList.innerHTML = reviews.map(review => `
            <div class="admin-list-item">
                <div>
                    <strong>${review.author}</strong>
                    <p>${review.text}</p>
                </div>
                <button onclick="admin.deleteReview('${review._id}')">Delete</button>
            </div>
        `).join('');
    }

    async deleteReview(reviewId) {
        try {
            const response = await fetch(`${config.API_URL}/api/reviews/${reviewId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete review');

            alert('Review deleted successfully!');
            this.loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review. Please try again.');
        }
    }

    calculateProfit() {
        // Get input values
        const clayCost = parseFloat(document.getElementById('clay-cost').value) || 0;
        const glazeCost = parseFloat(document.getElementById('glaze-cost').value) || 0;
        const packagingCost = parseFloat(document.getElementById('packaging-cost').value) || 0;
        const electricityCost = parseFloat(document.getElementById('electricity-cost').value) || 0;
        const laborCost = parseFloat(document.getElementById('labor-cost').value) || 0;
        const laborHours = parseFloat(document.getElementById('labor-hours').value) || 0;
        const sellingPrice = parseFloat(document.getElementById('selling-price').value) || 0;
        const monthlyUnits = parseInt(document.getElementById('monthly-units').value) || 0;

        // Calculate costs
        const materialCostPerUnit = clayCost + glazeCost + packagingCost;
        const laborCostPerUnit = laborCost * laborHours;
        const totalCostPerUnit = materialCostPerUnit + laborCostPerUnit + (electricityCost / monthlyUnits);
        const profitPerUnit = sellingPrice - totalCostPerUnit;
        const monthlyProfit = profitPerUnit * monthlyUnits;
        const profitMargin = (profitPerUnit / sellingPrice) * 100;

        // Display results
        const resultsDiv = document.getElementById('profit-results');
        resultsDiv.innerHTML = `
            <h4>Profit Analysis</h4>
            <p>Cost per unit: $${totalCostPerUnit.toFixed(2)}</p>
            <p>Profit per unit: $${profitPerUnit.toFixed(2)}</p>
            <p>Monthly profit: $${monthlyProfit.toFixed(2)}</p>
            <p>Profit margin: ${profitMargin.toFixed(1)}%</p>
        `;
        resultsDiv.classList.add('visible');
    }
}

// Initialize admin functionality and export instance
const admin = new Admin();
export default admin;

// Also expose to window for HTML event handlers
window.admin = admin;
window.calculateProfit = () => admin.calculateProfit(); 
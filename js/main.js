// Import modules
import { Cart } from './cart.js';
import { Auth } from './auth.js';
import { Navigation } from './navigation.js';
import { formatCurrency, handleImageLoad } from './utils.js';
import admin from './admin.js';
import config from './config.js';
import { Wishlist } from './wishlist.js';

// Global variables
let cart;
let auth;
let navigation;
let wishlist;

// Initialize application
async function initializeApp() {
    try {
        // Initialize core modules
        auth = new Auth();
        cart = new Cart();
        navigation = new Navigation();
        wishlist = new Wishlist();

        // Initialize dark mode
        initializeDarkMode();
        
        // Show initial page (about)
        showPage('about');
        
        // Load products for catalogue
        await fetchProducts();
        
        // Initialize gallery
        initializeGallery();
        
        // Update admin access
        auth.updateAdminAccess();
        
        // Add cart and wishlist icons
        addShoppingIcons();
        
        // Show main content and remove splash screen
        setTimeout(() => {
            document.querySelector('.main-content').classList.add('visible');
            document.querySelector('.splash-screen').classList.add('hidden');
            
            setTimeout(() => {
                const splashScreen = document.querySelector('.splash-screen');
                if (splashScreen) {
                    splashScreen.remove();
                }
            }, 500);
        }, 1500);

    } catch (error) {
        console.error('Initialization error:', error);
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.innerHTML = 'Error loading the application. <button onclick="window.location.reload()" class="retry-btn">Retry</button>';
        }
    }
}

// Dark mode functionality
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    const icon = document.querySelector('.dark-mode-toggle i');
    icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialize dark mode from localStorage
function initializeDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.dark-mode-toggle i').className = 'fas fa-sun';
    }
}

// Navigation
function showPage(pageId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        if (section.id === pageId) {
            section.style.display = 'block';
            setTimeout(() => section.classList.add('active'), 50);
        } else {
            section.classList.remove('active');
            section.style.display = 'none';
        }
    });
}

// Gallery functionality
function initializeGallery() {
    const galleryImages = Array.from(document.querySelectorAll('.gallery img'));
    
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('catalogue');
        });
    }
}

// Add shopping icons to header
function addShoppingIcons() {
    const header = document.querySelector('.header-title');
    if (!header) return;

    const iconContainer = document.createElement('div');
    iconContainer.className = 'header-icons';
    iconContainer.innerHTML = `
        <div class="wishlist-icon" onclick="wishlist.togglePanel()">
            <i class="far fa-heart"></i>
            <span class="wishlist-count">0</span>
        </div>
        <div class="cart-icon" onclick="cart.togglePanel()">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count">0</span>
        </div>
    `;
    header.appendChild(iconContainer);
}

// Fetch and display products
async function fetchProducts() {
    try {
        const response = await fetch(`${config.API_URL}/api/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products = await response.json();
        displayProducts(products);
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        const productsContainer = document.getElementById('products');
        if (productsContainer) {
            productsContainer.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
        }
        return [];
    }
}

// Display products
function displayProducts(products) {
    const productsContainer = document.getElementById('products');
    if (!productsContainer) return;

    if (!products.length) {
        productsContainer.innerHTML = '<p class="no-products">No products found.</p>';
        return;
    }

    productsContainer.innerHTML = products.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <img src="${product.imageUrl}" alt="${product.name}" loading="lazy" onerror="this.src='images/placeholder.png'">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button onclick="cart.addItem('${product._id}')" class="add-to-cart-btn">
                Add to Cart
            </button>
            <button onclick="wishlist.toggleItem('${product._id}')" class="wishlist-btn">
                <i class="far fa-heart"></i>
            </button>
        </div>
    `).join('');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initializeApp);

// Export objects and functions for use in HTML
window.cart = cart;
window.auth = auth;
window.wishlist = wishlist;
window.navigation = navigation;
window.toggleDarkMode = toggleDarkMode;
window.showPage = showPage;
window.fetchProducts = fetchProducts;

// Export additional functions needed by the HTML
window.toggleAccountPanel = () => auth.toggleAccountPanel();
window.toggleCartPanel = () => cart.togglePanel();
window.login = () => auth.login(
    document.getElementById('login-email').value,
    document.getElementById('login-password').value
);
window.register = () => auth.register(
    document.getElementById('register-name').value,
    document.getElementById('register-email').value,
    document.getElementById('register-password').value
);
window.showRegisterForm = () => auth.showRegisterForm();
window.showLoginForm = () => auth.showLoginForm();
window.logout = () => auth.logout();
window.checkout = () => cart.checkout();
window.updateCurrency = () => cart.updateDisplay();

// Export filtering functions
window.filterProducts = (category) => navigation.filterProducts(category);

// Add currency change function
function changeCurrency(currency) {
    localStorage.setItem('selectedCurrency', currency);
    // Refresh the product display
    if (window.admin) {
        window.admin.saveProducts();
    }
}

// Set initial currency selection
document.addEventListener('DOMContentLoaded', () => {
    const selectedCurrency = localStorage.getItem('selectedCurrency') || 'PLN';
    const currencySelector = document.querySelector('.currency-selector');
    if (currencySelector) {
        currencySelector.value = selectedCurrency;
    }
});

// DOM Elements
const sections = document.querySelectorAll('.content-section');
const navLinks = document.querySelectorAll('nav a');
const filterButtons = document.querySelectorAll('.filter-btn');

// Event Listeners
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        showPage(pageId);
    });
});

function openGalleryModal(img) {
    const modal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('modalMainImage');
    
    currentImageIndex = galleryImages.indexOf(img);
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    
    modal.classList.add('active');
}

function closeGalleryModal() {
    document.getElementById('galleryModal').classList.remove('active');
}

function previousImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateModalImage();
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateModalImage();
}

function updateModalImage() {
    const modalImg = document.getElementById('modalMainImage');
    const currentImg = galleryImages[currentImageIndex];
    modalImg.src = currentImg.src;
    modalImg.alt = currentImg.alt;
}

// Product filtering
let currentProducts = [];

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        filterProducts(category);
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Product search
const searchInput = document.getElementById('product-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = currentProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        displayProducts(filteredProducts);
    });
}

async function filterProducts(category) {
    if (!currentProducts.length) {
        await fetchProducts();
    }
    
    const filteredProducts = category === 'all' 
        ? currentProducts 
        : currentProducts.filter(product => product.category === category);
    
    displayProducts(filteredProducts);
} 
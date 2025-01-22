// Import modules
import { Cart } from './cart.js';
import { Auth } from './auth.js';
import { Navigation } from './navigation.js';
import { formatCurrency, handleImageLoad } from './utils.js';
import admin from './admin.js';
import config from './config.js';
import { Wishlist } from './wishlist.js';

// Global variables
const cart = new Cart();
const auth = new Auth();
const navigation = new Navigation();
const DEBUG = true;
const wishlist = new Wishlist();

// Debug logging
function debug(...args) {
    if (DEBUG) {
        console.log('[Debug]', ...args);
    }
}

// Gallery variables
let currentImageIndex = 0;
let galleryImages = [];

// Initialize application
async function initializeApp() {
    debug('Starting app initialization...');

    try {
        // Clear existing products from localStorage
        localStorage.removeItem('products');
        debug('Cleared existing products from localStorage');

        // Initialize navigation first
        debug('Initializing navigation...');
        navigation.init();

        // Initialize dark mode
        debug('Checking dark mode preference...');
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            document.querySelector('.dark-mode-toggle').textContent = 'Light Mode';
        }

        // Initialize user session
        debug('Checking user session...');
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            auth.user = JSON.parse(savedUser);
            auth.showAccountMenu();
            cart.loadCart();
        }

        // Show main content and remove splash screen
        debug('Transitioning from splash screen...');
        const mainContent = document.querySelector('.main-content');
        const splashScreen = document.querySelector('.splash-screen');

        // Add visible class to main content
        mainContent.classList.add('visible');

        // Add hidden class to splash screen after a delay
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            
            // Remove splash screen from DOM after transition
            setTimeout(() => {
                splashScreen.remove();
                debug('Splash screen removed, initialization complete.');
            }, 500); // Match this with the CSS transition duration
        }, 1000);

        // Initialize gallery
        initializeGallery();

        // Update admin access
        updateAdminAccess();

        // Add cart and wishlist icons
        addShoppingIcons();

    } catch (error) {
        console.error('Error during initialization:', error);
        const splashScreen = document.querySelector('.splash-screen');
        if (splashScreen) {
            const loadingText = splashScreen.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'Error loading the application. Please refresh the page.';
            }
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

// Event listeners
document.addEventListener('DOMContentLoaded', initializeApp);

// Export objects and functions for use in HTML
window.navigation = navigation;
window.cart = cart;
window.auth = auth;
window.wishlist = wishlist;
window.toggleDarkMode = toggleDarkMode;

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

// Navigation
function showPage(pageId) {
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

// Event Listeners
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        showPage(pageId);
    });
});

// Gallery functionality
function initializeGallery() {
    galleryImages = Array.from(document.querySelectorAll('.gallery img'));
    
    document.querySelector('.cta-button').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('catalogue');
    });
}

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

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch(`${config.API_URL}/api/products`);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        currentProducts = await response.json();
        displayProducts(currentProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products').innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
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
        </div>
    `).join('');
}

// Check admin access and show/hide admin link
function updateAdminAccess() {
    const adminLink = document.querySelector('.admin-link');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (adminLink) {
        adminLink.style.display = currentUser.isAdmin ? 'inline-block' : 'none';
    }
}

function addShoppingIcons() {
    const header = document.querySelector('.header-title');
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode
    initializeDarkMode();
    
    // Show initial page (about)
    showPage('about');
    
    // Load products for catalogue
    fetchProducts();
}); 
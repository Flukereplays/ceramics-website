// Import modules
import { Cart } from './cart.js';
import { Auth } from './auth.js';
import { Navigation } from './navigation.js';
import { formatCurrency, handleImageLoad } from './utils.js';
import admin from './admin.js';

// Global variables
const cart = new Cart();
const auth = new Auth();
const navigation = new Navigation();
const DEBUG = true;

// Debug logging
function debug(...args) {
    if (DEBUG) {
        console.log('[Debug]', ...args);
    }
}

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

// Dark mode toggle
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    const button = document.querySelector('.dark-mode-toggle');
    button.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
}

// Event listeners
document.addEventListener('DOMContentLoaded', initializeApp);

// Export objects and functions for use in HTML
window.navigation = navigation;
window.cart = cart;
window.auth = auth;
window.admin = admin;
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
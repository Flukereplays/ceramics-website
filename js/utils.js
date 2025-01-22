// Currency handling
export const EXCHANGE_RATES = {
    PLN: 1,
    EUR: 0.23
};

export function formatCurrency(amount, currency = null) {
    try {
        const selectedCurrency = currency || document.getElementById('currency-select').value;
        const rate = EXCHANGE_RATES[selectedCurrency] || 1;
        const convertedAmount = parseFloat(amount) * rate;
        
        if (isNaN(convertedAmount)) {
            console.error('Invalid amount:', amount);
            return '0.00';
        }

        const symbol = selectedCurrency === 'PLN' ? 'zł' : '€';
        return `${symbol} ${convertedAmount.toFixed(2)}`;
    } catch (error) {
        console.error('Error formatting currency:', error);
        return '0.00';
    }
}

// Image handling
export function handleImageLoad(img) {
    img.addEventListener('load', () => {
        img.classList.add('loaded');
        const container = img.closest('.product-image-container');
        if (container) {
            container.classList.add('loaded');
        }
    });

    img.addEventListener('error', () => {
        img.src = 'images/vase-illustration.avif';
        img.classList.add('loaded');
    });
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Animation helper
export function animateElement(element, properties, duration) {
    const start = performance.now();
    const initialValues = {};
    
    Object.keys(properties).forEach(prop => {
        initialValues[prop] = parseFloat(getComputedStyle(element)[prop]);
    });

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        Object.keys(properties).forEach(prop => {
            const value = initialValues[prop] + (properties[prop] - initialValues[prop]) * progress;
            element.style[prop] = `${value}px`;
        });

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Local storage helper
export function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error writing to localStorage:', error);
        return false;
    }
} 
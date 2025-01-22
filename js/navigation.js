export class Navigation {
    constructor() {
        this.currentPage = 'about';
        this.currentFilter = 'all';
        this.advancedFiltersVisible = false;
    }

    init() {
        // Initialize navigation based on URL hash
        const hash = window.location.hash.slice(1) || 'about';
        this.showPage(hash);

        // Add event listener for browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                this.showPage(event.state.page, false);
                if (event.state.filter) {
                    this.filterProducts(event.state.filter, false);
                }
            }
        });

        // Initialize filter buttons
        this.initializeFilterButtons();

        // Initialize advanced filters toggle
        this.initializeAdvancedFilters();
    }

    showPage(page) {
        // Hide current page with exit animation
        const currentPage = document.querySelector('.content-section.active');
        if (currentPage) {
            currentPage.classList.add('exit');
            setTimeout(() => {
                currentPage.classList.remove('active', 'exit');
            }, 600); // Match this with CSS animation duration
        }

        // Show new page with enter animation
        setTimeout(() => {
            const newPage = document.getElementById(page);
            if (newPage) {
                // Add animation delays to child elements
                if (page === 'gallery') {
                    const images = newPage.querySelectorAll('.gallery img');
                    images.forEach((img, index) => {
                        img.style.setProperty('--image-index', index);
                    });
                } else if (page === 'catalogue') {
                    const products = newPage.querySelectorAll('.product');
                    products.forEach((product, index) => {
                        product.style.setProperty('--product-index', index);
                    });
                } else if (page === 'about') {
                    const testimonials = newPage.querySelectorAll('.testimonial');
                    testimonials.forEach((testimonial, index) => {
                        testimonial.style.setProperty('--testimonial-index', index);
                    });
                }
                
                newPage.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 600); // Start after exit animation completes

        // Update URL hash
        window.location.hash = page;
    }

    filterProducts(category, updateHistory = true) {
        console.log('Filtering products:', category);
        
        // If not on catalogue page, switch to it first
        if (this.currentPage !== 'catalogue') {
            this.showPage('catalogue', updateHistory);
        }
        
        this.currentFilter = category;

        // Update active state of filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === category || 
               (btn.textContent === 'All' && category === 'all')) {
                btn.classList.add('active');
            }
        });

        // Filter products
        document.querySelectorAll('.product').forEach(product => {
            if (category === 'all' || product.dataset.category === category) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });

        // Update URL and history state if on catalogue page
        if (updateHistory && this.currentPage === 'catalogue') {
            window.history.pushState(
                { page: 'catalogue', filter: category },
                '',
                `#catalogue?filter=${category}`
            );
        }
    }

    initializeFilterButtons() {
        // Add click event listeners to filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.textContent.toLowerCase();
                this.filterProducts(category);
            });
        });

        // Add click event listeners to dropdown filter links
        document.querySelectorAll('.dropdown-content a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.textContent.toLowerCase().replace('all products', 'all');
                this.filterProducts(category);
            });
        });
    }

    initializeAdvancedFilters() {
        // Add click handler for toggle button
        const toggleBtn = document.querySelector('.filter-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleAdvancedFilters());
        }

        // Add change handlers for advanced filter inputs
        document.querySelectorAll('.advanced-filters select, .advanced-filters input').forEach(input => {
            input.addEventListener('change', () => this.applyAdvancedFilters());
        });
    }

    toggleAdvancedFilters() {
        const filtersSection = document.querySelector('.advanced-filters');
        const toggleBtn = document.querySelector('.filter-toggle');
        
        if (filtersSection) {
            this.advancedFiltersVisible = !this.advancedFiltersVisible;
            if (this.advancedFiltersVisible) {
                filtersSection.classList.add('visible');
                toggleBtn.textContent = 'Hide Advanced Filters';
            } else {
                filtersSection.classList.remove('visible');
                toggleBtn.textContent = 'Show Advanced Filters';
            }
        }
    }

    applyAdvancedFilters() {
        const sortSelect = document.getElementById('sort-select');
        const materialSelect = document.getElementById('material-select');
        const colorSelect = document.getElementById('color-select');
        const minPrice = document.getElementById('price-min');
        const maxPrice = document.getElementById('price-max');

        const products = document.querySelectorAll('.product');
        products.forEach(product => {
            let visible = true;

            // Apply material filter
            if (materialSelect.value !== 'all') {
                visible = visible && product.dataset.material === materialSelect.value;
            }

            // Apply color filter
            if (colorSelect.value !== 'all') {
                visible = visible && product.dataset.color === colorSelect.value;
            }

            // Apply price filter
            const price = parseFloat(product.dataset.price);
            if (minPrice.value && price < parseFloat(minPrice.value)) visible = false;
            if (maxPrice.value && price > parseFloat(maxPrice.value)) visible = false;

            // Show/hide product
            product.style.display = visible ? 'block' : 'none';
        });

        // Apply sorting
        if (sortSelect.value !== 'default') {
            this.sortProducts(sortSelect.value);
        }
    }

    sortProducts(sortBy) {
        const container = document.querySelector('.catalogue');
        const products = Array.from(container.children);

        products.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                case 'price-high':
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                case 'name-asc':
                    return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
                case 'name-desc':
                    return b.querySelector('h3').textContent.localeCompare(a.querySelector('h3').textContent);
                default:
                    return 0;
            }
        });

        // Re-append sorted products
        products.forEach(product => container.appendChild(product));
    }

    loadProductsFromStorage() {
        try {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const catalogueContainer = document.querySelector('.catalogue');
            
            if (products.length === 0) {
                catalogueContainer.innerHTML = `
                    <div class="no-products">
                        <p>No products available yet.</p>
                        <p>Products will be added through the admin interface.</p>
                    </div>
                `;
                return;
            }
            
            catalogueContainer.innerHTML = products.map(product => `
                <div class="product" 
                     data-category="${product.category}" 
                     data-price="${product.price}"
                     data-material="${product.material}"
                     data-color="${product.color}">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <h3>${product.name}</h3>
                    <p class="price" data-price="${product.price}">${formatCurrency(product.price)}</p>
                    <p class="product-details">${product.material} | ${product.color}</p>
                    <p class="product-description">${product.description}</p>
                    <button class="add-to-cart-btn" onclick="cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        Add to Cart
                    </button>
                </div>
            `).join('');

            // Initialize image loading for new products
            document.querySelectorAll('.product-image-container img').forEach(img => {
                img.addEventListener('load', () => img.classList.add('loaded'));
                img.addEventListener('error', () => {
                    img.src = 'images/placeholder.jpg';
                    img.classList.add('loaded');
                });
            });

            // Apply current filter
            if (this.currentFilter !== 'all') {
                this.filterProducts(this.currentFilter);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            const catalogueContainer = document.querySelector('.catalogue');
            catalogueContainer.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
        }
    }

    searchProducts(query) {
        query = query.toLowerCase().trim();
        const products = document.querySelectorAll('.product');
        
        products.forEach(product => {
            const name = product.querySelector('h3').textContent.toLowerCase();
            const description = product.querySelector('.description').textContent.toLowerCase();
            const material = product.dataset.material.toLowerCase();
            const color = product.dataset.color.toLowerCase();
            
            const matches = name.includes(query) || 
                          description.includes(query) || 
                          material.includes(query) || 
                          color.includes(query);
            
            if (query === '') {
                product.style.display = 'block';
                product.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                if (matches) {
                    product.style.display = 'block';
                    product.style.animation = 'fadeInUp 0.6s ease forwards';
                } else {
                    product.style.display = 'none';
                }
            }
        });
    }
} 
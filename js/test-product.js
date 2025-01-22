import config from './config.js';

const testProducts = [
    {
        name: "Elegant Blue Vase",
        description: "A stunning handcrafted vase with deep blue glazing",
        price: 129.99,
        imageUrl: "Website photos/Vase 01.png",
        category: "vase",
        inStock: true
    },
    {
        name: "Modern Ceramic Mug",
        description: "Contemporary design mug, perfect for your morning coffee",
        price: 39.99,
        imageUrl: "Website photos/Mug 01.png",
        category: "mug",
        inStock: true
    },
    {
        name: "Artisan Bowl Set",
        description: "Set of handmade ceramic bowls with natural finish",
        price: 89.99,
        imageUrl: "Website photos/Bowl 01.png",
        category: "bowl",
        inStock: true
    }
];

async function addTestProducts() {
    console.log('Starting to add test products...');
    
    for (const product of testProducts) {
        try {
            const response = await fetch(`${config.API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });

            const data = await response.json();
            console.log('Product added:', data);
        } catch (error) {
            console.error('Error adding product:', error);
        }
    }
}

async function fetchProducts() {
    try {
        console.log('Fetching products from:', `${config.API_URL}/api/products`);
        const response = await fetch(`${config.API_URL}/api/products`);
        const data = await response.json();
        console.log('Products retrieved:', data);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Run the tests
console.log('API URL:', config.API_URL);
addTestProducts().then(() => {
    console.log('Finished adding products, now fetching...');
    fetchProducts();
}); 
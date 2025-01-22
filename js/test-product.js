import config from './config.js';

async function addTestProduct() {
    const testProduct = {
        name: "Test Ceramic Vase",
        description: "A beautiful handcrafted vase",
        price: 99.99,
        imageUrl: "Website photos/Vase 01.png",
        category: "vase",
        inStock: true
    };

    try {
        const response = await fetch(`${config.API_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testProduct)
        });

        const data = await response.json();
        console.log('Product added:', data);
    } catch (error) {
        console.error('Error adding product:', error);
    }
}

// Run the test
addTestProduct(); 
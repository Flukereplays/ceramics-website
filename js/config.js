const config = {
    // Use the Render URL in production, localhost in development
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000'
        : 'https://ceramics-website-backend.onrender.com'
};

export default config; 
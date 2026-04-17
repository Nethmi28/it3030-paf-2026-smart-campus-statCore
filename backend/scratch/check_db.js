
const fetch = require('node-fetch');

async function checkResources() {
    const API_BASE = 'http://localhost:8089';
    try {
        // We need a token to fetch resources
        // Let's try to login as admin first
        const loginResp = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@facilio.com', password: 'admin123' })
        });
        const loginData = await loginResp.json();
        const token = loginData.token;

        const resp = await fetch(`${API_BASE}/api/resources`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const resources = await resp.json();
        console.log('Sample Resource Image URL:', resources[0]?.imageUrl);
        console.log('Total Resources:', resources.length);
        console.log('First 5 image URLs:', resources.slice(0, 5).map(r => r.imageUrl));
    } catch (e) {
        console.error('Error fetching resources:', e.message);
    }
}

checkResources();

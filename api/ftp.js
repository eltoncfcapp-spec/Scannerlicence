export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Your PHP bridge URL
    const BRIDGE_URL = 'https://jmb-electricalsolar.co.za/licence-api.php';

    try {
        if (req.method === 'POST') {
            const response = await fetch(BRIDGE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'eaglesync-secret-key-2024'
                },
                body: JSON.stringify(req.body)
            });
            const data = await response.json();
            return res.status(response.status).json(data);
        }

        if (req.method === 'GET') {
            const computer = req.query.computer;
            const response = await fetch(`${BRIDGE_URL}?computer=${encodeURIComponent(computer)}`);
            const data = await response.json();
            return res.status(response.status).json(data);
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

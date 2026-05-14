// EagleSync Licence API - HTTP/HTTPS Version
// Deployed to Vercel, connects to your PHP script on jmb-electricalsolar.co.za

export default async function handler(req, res) {
    // Enable CORS for GitHub Pages
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Your PHP API endpoint (works on HTTPS port 443 - never blocked)
    const PHP_API_URL = 'https://jmb-electricalsolar.co.za/licence-api.php';

    try {
        // ============================================================
        // POST - UPLOAD LICENCE
        // ============================================================
        if (req.method === 'POST') {
            const { computerName, licence } = req.body;

            if (!computerName || !licence) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing computerName or licence data'
                });
            }

            console.log(`📤 Uploading licence for: ${computerName}`);

            const response = await fetch(PHP_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.UPLOAD_API_KEY || 'eaglesync-secret-key-2024'
                },
                body: JSON.stringify({
                    computerName: computerName,
                    licence: licence
                })
            });

            const data = await response.json();
            return res.status(response.status).json(data);
        }

        // ============================================================
        // GET - DOWNLOAD LICENCE
        // ============================================================
        if (req.method === 'GET') {
            const computerName = req.query.computer;

            if (!computerName) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing computer name. Use: ?computer=NAME'
                });
            }

            console.log(`📥 Downloading licence for: ${computerName}`);

            const response = await fetch(`${PHP_API_URL}?computer=${encodeURIComponent(computerName)}`);
            
            if (!response.ok) {
                return res.status(response.status).json({
                    success: false,
                    error: `HTTP ${response.status}`
                });
            }

            const data = await response.json();
            
            if (data.error) {
                return res.status(404).json({
                    success: false,
                    error: data.error
                });
            }
            
            return res.status(200).json({
                success: true,
                licence: data,
                message: `Licence downloaded for ${computerName}`
            });
        }

        // Method not allowed
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use GET or POST.'
        });

    } catch (error) {
        console.error('API Error:', error);
        
        return res.status(500).json({
            success: false,
            error: error.message,
            hint: 'Make sure PHP script is at: https://jmb-electricalsolar.co.za/licence-api.php'
        });
    }
}

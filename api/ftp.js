// EagleSync FTP API - Deploy to Vercel
import { Client } from 'basic-ftp';

export default async function handler(req, res) {
    // Enable CORS for GitHub Pages
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Your FTP Configuration
    const ftpConfig = {
        host: 'ftp.jmb-electricalsolar.co.za',
        user: 'Scan@jmb-electricalsolar.co.za',
        password: process.env.FTP_PASSWORD,
        secure: false,
        port: 21
    };

    const client = new Client();

    try {
        await client.access(ftpConfig);
        
        if (req.method === 'POST') {
            // Handle Upload
            const { computerName, licence } = req.body;
            
            if (!computerName || !licence) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Missing computerName or licence data' 
                });
            }

            const fileName = `${computerName}.json`;
            const fileContent = JSON.stringify(licence, null, 2);
            
            await client.ensureDir('/Scan');
            
            const { Readable } = await import('stream');
            const stream = Readable.from(fileContent);
            await client.uploadFrom(stream, `/Scan/${fileName}`);
            
            client.close();
            
            return res.status(200).json({ 
                success: true, 
                message: `Licence uploaded for ${computerName}`,
                file: `/Scan/${fileName}`
            });
            
        } else if (req.method === 'GET') {
            // Handle Download
            const computerName = req.query.computer;
            
            if (!computerName) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Missing computer name parameter' 
                });
            }

            const fileName = `${computerName}.json`;
            const remotePath = `/Scan/${fileName}`;
            
            let fileContent = '';
            const { Writable } = await import('stream');
            
            await client.downloadTo(new Writable({
                write(chunk, encoding, callback) {
                    fileContent += chunk.toString();
                    callback();
                }
            }), remotePath);
            
            client.close();
            
            const licence = JSON.parse(fileContent);
            
            return res.status(200).json({ 
                success: true, 
                licence: licence,
                message: `Licence downloaded for ${computerName}`
            });
        }
        
        return res.status(405).json({ success: false, error: 'Method not allowed' });
        
    } catch (error) {
        console.error('FTP Error:', error);
        client.close();
        
        return res.status(500).json({ 
            success: false, 
            error: error.message
        });
    }
}

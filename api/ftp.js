import { Client } from 'ssh2';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const conn = new Client();
    
    const sftpConfig = {
        host: 'jmb-electricalsolar.co.za',  // Note: no ftp. prefix
        port: 22,
        username: 'Scan@jmb-electricalsolar.co.za',
        password: process.env.FTP_PASSWORD
    };

    try {
        await new Promise((resolve, reject) => {
            conn.on('ready', resolve);
            conn.on('error', reject);
            conn.connect(sftpConfig);
        });

        conn.sftp(async (err, sftp) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            if (req.method === 'POST') {
                const { computerName, licence } = req.body;
                const fileName = `${computerName}.json`;
                const fileContent = JSON.stringify(licence, null, 2);
                
                sftp.writeFile(`/Scan/${fileName}`, fileContent, (err) => {
                    sftp.end();
                    conn.end();
                    if (err) {
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    res.status(200).json({ success: true, message: `Uploaded ${fileName}` });
                });
            } else if (req.method === 'GET') {
                const computerName = req.query.computer;
                const fileName = `${computerName}.json`;
                
                sftp.readFile(`/Scan/${fileName}`, (err, data) => {
                    sftp.end();
                    conn.end();
                    if (err) {
                        return res.status(500).json({ success: false, error: 'File not found' });
                    }
                    const licence = JSON.parse(data.toString());
                    res.status(200).json({ success: true, licence });
                });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

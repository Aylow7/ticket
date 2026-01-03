const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3256;
const WEB_TOKEN = process.env.WEB_TOKEN;

const transcriptsDir = path.join(__dirname, 'transcripts');
if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir, { recursive: true });
}

app.use(express.json({ limit: '50mb' }));

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.warn('❌ Pas de header Authorization');
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== WEB_TOKEN) {
        console.warn(`❌ Token invalide: ${token.substring(0, 5)}...`);
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.log('✅ Token valide');
    next();
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/transcripts', verifyToken, (req, res) => {
    try {
        const { ticketId, guildId, userId, channelName, html } = req.body;

        console.log(`📥 Réception transcript: ${ticketId}`);

        if (!ticketId || !html) {
            console.error('❌ Champs manquants:', { ticketId: !!ticketId, html: !!html });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const fileName = `${ticketId}_${Date.now()}.html`;
        const filePath = path.join(transcriptsDir, fileName);

        fs.writeFileSync(filePath, html);
        console.log(`✅ Fichier sauvegardé: ${fileName}`);

        const webUrl = process.env.WEB_URL || `http://localhost:${PORT}`;
        const url = `${webUrl}/transcripts/${fileName}`;

        res.json({
            success: true,
            url,
            ticketId,
            fileName,
            createdAt: new Date().toISOString()
        });

        console.log(`✅ URL générée: ${url}`);
    } catch (error) {
        console.error('❌ Transcript upload error:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

app.get('/transcripts/:filename', (req, res) => {
    try {
        const filePath = path.join(transcriptsDir, req.params.filename);

        // Sécurité: éviter les path traversal
        if (!filePath.startsWith(transcriptsDir)) {
            return res.status(403).send('Forbidden');
        }

        if (!fs.existsSync(filePath)) {
            console.warn(`❌ Fichier non trouvé: ${req.params.filename}`);
            return res.status(404).send('Transcript not found');
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.sendFile(filePath);
        console.log(`📖 Transcript servit: ${req.params.filename}`);
    } catch (error) {
        console.error('❌ Transcript retrieval error:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/tickets', verifyToken, (req, res) => {
    try {
        const files = fs.readdirSync(transcriptsDir);
        const tickets = files.map(f => ({
            filename: f,
            path: `/transcripts/${f}`,
            size: fs.statSync(path.join(transcriptsDir, f)).size
        }));
        res.json({ tickets, count: tickets.length });
    } catch (error) {
        console.error('❌ Tickets list error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Web server running on http://localhost:${PORT}`);
    console.log(`📝 Transcripts dir: ${transcriptsDir}`);
    console.log(`🔑 Token: ${WEB_TOKEN.substring(0, 5)}...${WEB_TOKEN.substring(-5)}`);
    console.log(`🌐 Web URL: ${process.env.WEB_URL || `http://localhost:${PORT}`}\n`);
});
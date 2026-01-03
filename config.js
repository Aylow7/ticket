module.exports = {
    clientId: process.env.CLIENT_ID || '1351915728223211582',
    prefix: '+',
    token: process.env.DISCORD_TOKEN,
    colorP: "#FF5733",
    webServerUrl: process.env.WEB_SERVER_URL || 'http://localhost:3001',
    webToken: process.env.WEB_TOKEN,
    defaultSettings: {
        claimEnabled: true,
        closeEnabled: true,
        reopenEnabled: true,
        transcriptEnabled: true,
        autoCloseTime: 0,
        cooldown: 5,
        maxOpenTickets: 5
    }
};
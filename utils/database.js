const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function ensureFile(filename, defaultData = {}) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

function getData(filename) {
    ensureFile(filename);
    const filePath = path.join(dataDir, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveData(filename, data) {
    ensureFile(filename);
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getGuildData(guildId) {
    const data = getData('guilds.json');
    if (!data[guildId]) {
        data[guildId] = {
            panels: [],
            settings: {}
        };
        saveData('guilds.json', data);
    }
    return data[guildId];
}

function getTickets() {
    ensureFile('tickets.json', {});
    return getData('tickets.json');
}

function getTicketsByGuild(guildId) {
    const tickets = getTickets();
    return Object.values(tickets).filter(t => t.guildId === guildId);
}

function getTicket(ticketId) {
    return getTickets()[ticketId];
}

function saveTicket(ticketId, data) {
    const tickets = getTickets();
    tickets[ticketId] = { ...tickets[ticketId], ...data, updated: Date.now() };
    saveData('tickets.json', tickets);
    return tickets[ticketId];
}

function deleteTicket(ticketId) {
    const tickets = getTickets();
    delete tickets[ticketId];
    saveData('tickets.json', tickets);
}

function saveGuildData(guildId, data) {
    const allData = getData('guilds.json');
    allData[guildId] = { ...allData[guildId], ...data };
    saveData('guilds.json', allData);
}

module.exports = {
    getData, saveData, getGuildData, saveGuildData,
    getTickets, getTicketsByGuild, getTicket, saveTicket, deleteTicket
};
# 🎫 Système de Tickets Discord Ultra-Complet

Système de tickets Discord professionnel, entièrement configurable via une seule commande prefix, avec architecture modulaire et serveur web intégré pour les transcripts.

## 📋 Fonctionnalités

### Panel de Configuration
- **+ticket-config** : Commande unique pour configurer tout le système
- Gestion complète via interface interactive (buttons, select menus, modals)
- Création/modification/suppression de panneaux de tickets
- Configuration sans éditer le code

### Système de Tickets
- Création via select menu du panneau
- Nommage automatique `ticket-username`
- Permissions instantanées par rôle
- Types de tickets configurables (support, report, achat, custom)
- Limite de tickets ouverts par utilisateur

### Gestion des Tickets
- **Claim** : Assigner un ticket à un modérateur
- **Close** : Fermer avec raison personnalisée
- **Reopen** : Réouvrir un ticket fermé
- **Transcript** : Générer un transcript HTML avec upload
- **Add/Remove** : Ajouter/retirer des utilisateurs

### Transcript Web
- Génération HTML complète et stylisée
- Support complet des embeds, pièces jointes, boutons
- Conversion markdown vers HTML
- Upload automatique vers serveur web
- URL publique accessible
- CDN discord-components pour rendu authentique Discord

### Architecture
```
bot/
├─ index.js (entrée principale)
├─ config.js (configuration)
├─ handlers/ (commandHandler, eventHandler)
├─ commands/ (commandes prefix)
├─ events/ (ready, messageCreate, interactionCreate)
├─ interactions/ (buttons, selectMenus, modals)
├─ tickets/ (ticketManager)
├─ utils/ (database, transcriptGenerator)
└─ data/ (JSON)

web/
├─ index.js (serveur Express)
└─ transcripts/ (stockage HTML)
```

## 🚀 Installation

### Prérequis
- Node.js 16+
- npm ou yarn
- Token Discord Bot avec permissions

### Étapes

1. **Cloner et installer**
```bash
npm install
```

2. **Configurer .env**
```
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id
WEB_TOKEN=your_secure_token
WEB_SERVER_URL=http://localhost:3001
```

3. **Lancer le bot**
```bash
npm start
```

4. **Lancer le serveur web** (dans un autre terminal)
```bash
npm run web
```

## 📖 Utilisation

### Configuration initiale
1. Tapez `+ticket-config` en tant qu'admin
2. Cliquez sur "➕ Créer un panneau"
3. Remplissez le formulaire étape par étape
4. Sélectionnez salon, catégorie, types et rôles
5. Le panneau est créé automatiquement dans le salon

### Créer un Ticket
- Cliquez sur le select menu du panneau
- Choisissez le type de ticket
- Un canal privé est créé instantanément

### Gérer un Ticket
- **Assigner** : Cliquez sur le bouton "Assigner"
- **Ajouter un membre** : Cliquez sur "Ajouter membre"
- **Retirer un membre** : Cliquez sur "Retirer membre"
- **Transcript** : Cliquez sur "📄 Transcript" pour générer
- **Fermer** : Cliquez sur "Fermer" et donnez une raison

## ⚙️ Paramètres Configurables

Via la base JSON `data/guilds.json` :

```json
{
  "guildId": {
    "panels": [...],
    "settings": {
      "maxOpenTickets": 5,
      "autoCloseTime": 0,
      "cooldown": 5
    }
  }
}
```

## 🔒 Permissions

- **Support** : Accès complet via rôles configurables
- **Utilisateur** : Accès au ticket + retrait autorisé
- **Admin** : Accès total à la configuration

## 🌐 API Web

### POST /api/transcripts
Upload un transcript HTML
```json
{
  "ticketId": "id",
  "guildId": "id",
  "userId": "id",
  "html": "..."
}
```

### GET /transcripts/{filename}
Récupère un transcript public

### GET /api/tickets
Liste tous les transcripts

## 📝 Structure des Données

### tickets.json
```json
{
  "channelId": {
    "id": "...",
    "guildId": "...",
    "userId": "...",
    "type": "support",
    "claimed": false,
    "closed": false,
    "transcriptUrl": "..."
  }
}
```

### guilds.json
```json
{
  "guildId": {
    "panels": [
      {
        "id": "...",
        "name": "Support",
        "channelId": "...",
        "categoryId": "...",
        "types": ["support", "report"],
        "supportRoles": ["..."]
      }
    ]
  }
}
```

## 🎨 Customisation

### Couleur principale
Modifiez `config.colorP` pour changer la couleur des embeds

### Style des embeds
Tous les embeds sont générés dynamiquement via `EmbedBuilder`

### Messages
Les messages sont définis en inline, facilitant la traduction

## 📊 Performances

- Gestion efficace des JSON
- Pas de base de données externe
- Interactions temps réel sans délai
- Transcripts générés à la demande

## 🐛 Debugging

Les erreurs sont loggées en console. Activez le mode debug:
```javascript
// Dans index.js
process.on('uncaughtException', err => console.error('Exception:', err));
```

## 📄 Licence
[MIT](https://github.com/Aylow7/ticket/blob/main/LICENSE)

## 🤝 Support

Pour toute question, consultez la structure et modifiez selon vos besoins.

**Créé avec ❤️ par AylowDev**
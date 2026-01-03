function escapeHTML(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function parseMarkdown(text) {
  let html = text || "";
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  html = html.replace(/__(.*?)__/g, "<u>$1</u>");
  html = html.replace(/~~(.*?)~~/g, "<s>$1</s>");
  html = html.replace(/`([^`]+)`/g, "<code style='background:#2c2f33;padding:2px 4px;border-radius:3px;font-family:monospace;'>$1</code>");
  html = html.replace(/```([\s\S]*?)```/g, "<pre style='background:#2c2f33;padding:10px;border-radius:4px;overflow-x:auto;'><code>$1</code></pre>");
  return html;
}

function processContent(content, message) {
  let processed = escapeHTML(content || "");

  message.mentions.users.forEach((user) => {
    processed = processed.replace(
      new RegExp(escapeHTML(`<@${user.id}>`), "g"),
      `<discord-mention type="user">${escapeHTML(`@${user.username}`)}</discord-mention>`
    );
  });

  message.mentions.roles.forEach((role) => {
    processed = processed.replace(
      new RegExp(escapeHTML(`<@&${role.id}>`), "g"),
      `<discord-mention type="role">${escapeHTML(`@${role.name}`)}</discord-mention>`
    );
  });

  message.mentions.channels.forEach((channel) => {
    processed = processed.replace(
      new RegExp(escapeHTML(`<#${channel.id}>`), "g"),
      `<discord-mention type="channel">${escapeHTML(`#${channel.name}`)}</discord-mention>`
    );
  });

  return parseMarkdown(processed);
}

function getBotBadge(author) {
  if (author.bot) {
    return author.flags?.has("VerifiedBot")
      ? `<discord-bot-tag verified></discord-bot-tag>`
      : `<discord-bot-tag></discord-bot-tag>`;
  }
  return "";
}

async function generateTranscript(channel, guild, client) {
  const messages = [];
  let lastId;

  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;

    const fetched = await channel.messages.fetch(options);
    if (fetched.size === 0) break;

    messages.push(...fetched.values());
    lastId = fetched.last().id;
  }

  messages.reverse();

  const profiles = new Map();

  for (const msg of messages) {
    const authorId = msg.author.id;
    if (!profiles.has(authorId)) {
      profiles.set(authorId, {
        author: msg.author.username,
        avatar: msg.author.displayAvatarURL({ format: "png", size: 128 }),
        bot: msg.author.bot,
        roleColor: "#ffffff",
        verified: msg.author.system || false,
      });
    }

    msg.mentions.users.forEach((user) => {
      if (!profiles.has(user.id)) {
        profiles.set(user.id, {
          author: user.username,
          avatar: user.displayAvatarURL({ format: "png", size: 128 }),
          bot: user.bot,
          roleColor: "#ffffff",
          verified: false,
        });
      }
    });
  }

  const botAvatar = client.user.displayAvatarURL({ format: "png", size: 128 });
  const serverIcon = guild.iconURL({ format: "png", size: 128 }) || "";

  let profilesScript = "const profiles = {\n";
  profiles.forEach((profile, id) => {
    profilesScript += `  "${id}": ${JSON.stringify(profile)},\n`;
  });
  profilesScript += "};\nwindow.$discordMessage = window.$discordMessage || {};\nwindow.$discordMessage.profiles = profiles;";

  let messagesHTML = "";

  for (const msg of messages) {
    const profileId = msg.author.id;
    let messageHTML = `<discord-message id="m-${msg.id}" profile="${profileId}" timestamp="${new Date(msg.createdTimestamp).toISOString()}"${msg.editedTimestamp ? ' edited="true"' : ""}>`;

    messageHTML += getBotBadge(msg.author);

    if (msg.reference?.messageId) {
      try {
        const replied = await msg.channel.messages.fetch(msg.reference.messageId);
        const repProfile = profiles.get(replied.author.id) || {};
        messageHTML += `<discord-reply slot="reply" profile="${replied.author.id}" bot="${!!repProfile.bot}">
          <span data-goto="m-${replied.id}">${escapeHTML(replied.content?.substring(0, 80) || "Message original")}</span>
        </discord-reply>`;
      } catch {}
    }

    if (msg.content) {
      messageHTML += processContent(msg.content, msg);
    }

    if (msg.embeds.length > 0) {
      msg.embeds.forEach((embed) => {
        let embedHTML = `<discord-embed slot="embeds"`;
        if (embed.color) embedHTML += ` color="#${embed.color.toString(16).padStart(6, "0")}"`;
        embedHTML += `>`;

        if (embed.author?.name) {
          embedHTML += `<discord-embed-author slot="author" author-name="${escapeHTML(embed.author.name)}"`;
          if (embed.author.url) embedHTML += ` author-url="${embed.author.url}"`;
          if (embed.author.iconURL) embedHTML += ` icon-url="${embed.author.iconURL}"`;
          embedHTML += `></discord-embed-author>`;
        }

        if (embed.title) {
          embedHTML += `<discord-embed-title slot="title">${escapeHTML(embed.title)}</discord-embed-title>`;
        }

        if (embed.description) {
          embedHTML += `<discord-embed-description slot="description">${parseMarkdown(escapeHTML(embed.description))}</discord-embed-description>`;
        }

        if (embed.fields?.length > 0) {
          embedHTML += `<discord-embed-fields slot="fields">`;
          embed.fields.forEach((field) => {
            embedHTML += `<discord-embed-field field-title="${escapeHTML(field.name)}"${field.inline ? " inline" : ""}>${parseMarkdown(escapeHTML(field.value))}</discord-embed-field>`;
          });
          embedHTML += `</discord-embed-fields>`;
        }

        if (embed.thumbnail?.url) {
          embedHTML += `<discord-embed-thumbnail slot="thumbnail" url="${embed.thumbnail.url}"></discord-embed-thumbnail>`;
        }

        if (embed.image?.url) {
          embedHTML += `<discord-embed-image slot="image" url="${embed.image.url}"></discord-embed-image>`;
        }

        if (embed.footer || embed.timestamp) {
          embedHTML += `<discord-embed-footer slot="footer"`;
          if (embed.footer?.iconURL) embedHTML += ` footer-image="${embed.footer.iconURL}"`;
          if (embed.timestamp) embedHTML += ` timestamp="${new Date(embed.timestamp).toISOString()}"`;
          embedHTML += `>${escapeHTML(embed.footer?.text || "")}</discord-embed-footer>`;
        }

        embedHTML += `</discord-embed>`;
        messageHTML += embedHTML;
      });
    }

    if (msg.attachments.size > 0) {
      msg.attachments.forEach((att) => {
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(att.url)) {
          messageHTML += `<img src="${att.url}" style="max-width:100%;border-radius:4px;margin-top:10px;" alt="${escapeHTML(att.name)}">`;
        } else {
          messageHTML += `<a href="${att.url}" target="_blank" style="color:#00b0f4;">${escapeHTML(att.name)}</a><br>`;
        }
      });
    }

    let componentsHTML = "";
    if (msg.components.length > 0) {
      componentsHTML += `<div slot="components" class="components-container">`;
      msg.components.forEach((row, rowIdx) => {
        componentsHTML += `<div class="action-row">`;
        row.components.forEach((comp, compIdx) => {
          if (comp.type === 2) {
            const styleMap = { 
              1: "primary", 
              2: "secondary", 
              3: "success", 
              4: "danger", 
              5: "link" 
            };
            const buttonStyle = styleMap[comp.style] || "secondary";
            componentsHTML += `<button class="discord-button discord-button-${buttonStyle}" data-button-id="btn-${msg.id}-${rowIdx}-${compIdx}">`;
            if (comp.emoji) {
              if (comp.emoji.id) {
                componentsHTML += `<img class="button-emoji" src="https://cdn.discordapp.com/emojis/${comp.emoji.id}.${comp.emoji.animated ? "gif" : "png"}" alt="${comp.emoji.name}">`;
              } else {
                componentsHTML += `<span class="button-emoji">${comp.emoji.name}</span>`;
              }
            }
            componentsHTML += `<span class="button-label">${escapeHTML(comp.label || "")}</span>`;
            componentsHTML += `</button>`;
          } else if (comp.type === 3) {
            componentsHTML += `<select class="discord-select" data-select-id="sel-${msg.id}-${rowIdx}-${compIdx}">`;
            componentsHTML += `<option value="" disabled selected>${escapeHTML(comp.placeholder || "Sélectionner...")}</option>`;
            comp.options?.forEach((opt) => {
              componentsHTML += `<option value="${escapeHTML(opt.value)}"${opt.default ? " selected" : ""}>${escapeHTML(opt.label)}</option>`;
            });
            componentsHTML += `</select>`;
          }
        });
        componentsHTML += `</div>`;
      });
      componentsHTML += `</div>`;
    }

    messageHTML += componentsHTML + `</discord-message>`;
    messagesHTML += messageHTML + "\n";
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transcript - #${escapeHTML(channel.name)}</title>
  <link rel="icon" type="image/png" href="${botAvatar}">
  <script type="module" src="https://cdn.jsdelivr.net/npm/@derockdev/discord-components-core@latest/dist/derockdev-discord-components-core/derockdev-discord-components-core.esm.js"></script>
  <style>
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    
    body { 
      background: #36393f;
      color: #dcddde;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;
      padding: 20px;
      margin: 0;
    }
    
    discord-messages { 
      min-height: 100vh;
      max-width: 100%;
    }
    
    .header { 
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 30px;
      padding: 20px;
      background: #2f3136;
      border-radius: 8px;
      flex-wrap: wrap;
    }
    
    .server-icon { 
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }
    
    .server-icon img { 
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .header > div:last-child {
      flex: 1;
      min-width: 200px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 1.5em;
      font-weight: 600;
      color: #ffffff;
    }
    
    .header p {
      margin: 5px 0 0 0;
      color: #72767d;
      font-size: 0.95em;
    }
    
    .footer { 
      text-align: center;
      color: #72767d;
      margin-top: 30px;
      padding: 20px;
      font-size: 0.9em;
    }
    
    @media (max-width: 768px) {
      body { padding: 10px; }
      .header { padding: 15px; gap: 10px; }
      .header h1 { font-size: 1.3em; }
    }
    
    @media (max-width: 480px) {
      body { padding: 5px; }
      .header { padding: 10px; gap: 8px; }
      .server-icon { width: 48px; height: 48px; }
      .header h1 { font-size: 1.1em; }
    }
    
    .components-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .action-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    
    .discord-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 16px;
      border: none;
      border-radius: 3px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      user-select: none;
      white-space: nowrap;
      transition: background-color 0.17s ease;
    }
    
    .discord-button-primary {
      background-color: #5865f2;
      color: #ffffff;
    }
    
    .discord-button-primary:hover {
      background-color: #4752c4;
    }
    
    .discord-button-secondary {
      background-color: #4e5058;
      color: #ffffff;
    }
    
    .discord-button-secondary:hover {
      background-color: #36393f;
    }
    
    .discord-button-success {
      background-color: #3ba563;
      color: #ffffff;
      font-weight: 600;
    }
    
    .discord-button-success:hover {
      background-color: #2f8659;
    }
    
    .discord-button-danger {
      background-color: #ed4245;
      color: #ffffff;
    }
    
    .discord-button-danger:hover {
      background-color: #d83c3e;
    }
    
    .discord-button-link {
      background-color: transparent;
      color: #5865f2;
      border: 2px solid #5865f2;
      padding: 6px 14px;
    }
    
    .discord-button-link:hover {
      background-color: #5865f2;
      color: #ffffff;
    }
    
    .button-emoji {
      height: 20px;
      width: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .button-emoji img {
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
    
    .discord-select {
      appearance: none;
      background-color: #2c2f33;
      color: #dcddde;
      border: 1px solid #202225;
      border-radius: 3px;
      padding: 10px 12px;
      padding-right: 32px;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      min-width: 160px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23dcddde' d='M0.97 7.06 L6 2.3 L11.03 7.05 Q11.6 7.6 12 7.6 L12 8 L0 8 Q0 7.6 0.4 7.06 Z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 12px;
    }
    
    .discord-select option {
      background-color: #36393f;
      color: #dcddde;
    }
    
    @media (max-width: 480px) {
      .action-row {
        flex-direction: column;
      }
      
      .discord-button {
        width: 100%;
      }
      
      .discord-select {
        width: 100%;
        min-width: 100%;
      }
    }
    
    discord-reply {
      border-left: 3px solid #5865f2;
      padding-left: 8px;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-16px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    discord-message.highlight {
      animation: highlightMsg 0.8s ease-out;
      border-left: 4px solid #5865f2 !important;
    }
    
    @keyframes highlightMsg {
      0% {
        background: rgba(88, 101, 242, 0.2);
      }
      100% {
        background: transparent;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="server-icon">
      ${serverIcon ? `<img src="${serverIcon}" alt="${guild.name}">` : `<div style="background:#5865f2;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;">${guild.name[0]}</div>`}
    </div>
    <div>
      <h1>${escapeHTML(guild.name)}</h1>
      <p>#${escapeHTML(channel.name)}</p>
    </div>
  </div>

  <discord-messages>${messagesHTML}</discord-messages>

  <div class="footer">Exporté ${messages.length} message${messages.length > 1 ? "s" : ""}.</div>

  <script>${profilesScript}</script>
  <script>
    document.addEventListener("click", e => {
      if (e.target.hasAttribute("data-goto")) {
        const id = e.target.getAttribute("data-goto");
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({behavior:"smooth", block:"center"});
          el.classList.add("highlight");
          setTimeout(() => el.classList.remove("highlight"), 1500);
        }
      }
      
      if (e.target.classList.contains("discord-button")) {
        const buttonId = e.target.getAttribute("data-button-id");
        const label = e.target.textContent;
        console.log("Button clicked:", {buttonId, label});
      }
    });

    document.addEventListener("change", e => {
      if (e.target.classList.contains("discord-select")) {
        const selectId = e.target.getAttribute("data-select-id");
        const value = e.target.value;
        const text = e.target.options[e.target.selectedIndex].text;
        console.log("Select changed:", {selectId, value, text});
        
        e.target.style.opacity = "0.8";
        setTimeout(() => e.target.style.opacity = "1", 150);
      }
    });
  </script>
</body>
</html>`;

  return { html, messageCount: messages.length };
}

module.exports = { generateTranscript };
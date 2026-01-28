const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// --- MINI SERVIDOR WEB ---
const app = express();
app.get('/', (req, res) => res.send('Bot Online! 🤖'));
app.listen(process.env.PORT || 3000); 

// --- CONFIGURAÇÃO DO BOT ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Logado como ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
  if (msg.author.bot) return;

  if (msg.content.toLowerCase() === '!ping') {
    msg.reply('🏓 Pong!');
  }
});

client.login(process.env.DISCORD_TOKEN);

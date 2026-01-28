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
  if (msg.content.startsWith('!dado')) {
  const resultado = Math.floor(Math.random() * 6) + 1;
  msg.reply(`🎲 O dado caiu em: **${resultado}**`);
  }
  if (msg.content.startsWith('!limpar')) {
  const amount = parseInt(msg.content.split(' ')[1]); // Pega o número após o comando
  if (isNaN(amount) || amount <= 0) return msg.reply('Diga quantas mensagens apagar (1-100)!');
  
  msg.channel.bulkDelete(amount + 1, true);
  msg.channel.send(`🧹 Limpei **${amount}** mensagens para você!`).then(m => setTimeout(() => m.delete(), 3000));
  }
  
});

client.login(process.env.DISCORD_TOKEN);

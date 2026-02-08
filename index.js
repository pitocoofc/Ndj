const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const Groq = require("groq-sdk"); // Nova biblioteca Groq

// --- MINI SERVIDOR WEB PARA O RENDER ---
const app = express();
app.get('/', (req, res) => res.send('Instrutor Militar Online (Groq Edition)! 🪖'));
app.listen(process.env.PORT || 3000); 

// --- CONFIGURAÇÃO DA IA (GROQ) ---
// No Render, adicione a variável GROQ_API_KEY nas configurações
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- CONFIGURAÇÃO DO BOT DISCORD ---
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

client.on('messageCreate', async msg => {
  if (msg.author.bot) return;

  // Comando: !ping
  if (msg.content.toLowerCase() === '!ping') {
    return msg.reply('🏓 Pong!');
  }

  // Comando: !dado
  if (msg.content.startsWith('!dado')) {
    const resultado = Math.floor(Math.random() * 6) + 1;
    return msg.reply(`🎲 O dado caiu em: **${resultado}**`);
  }

  // Comando: !limpar
  if (msg.content.startsWith('!limpar')) {
    const amount = parseInt(msg.content.split(' ')[1]);
    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return msg.reply('Diga quantas mensagens apagar (1-100)!');
    }
    
    await msg.channel.bulkDelete(amount + 1, true);
    return msg.channel.send(`Sweep! 🧹 Limpei **${amount}** mensagens!`)
      .then(m => setTimeout(() => m.delete(), 3000));
  }

  // Comando: !avatar
  if (msg.content.startsWith('!avatar')) {
    const usuario = msg.mentions.users.first() || msg.author;
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🖼️ Avatar de ${usuario.username}`)
      .setImage(usuario.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setFooter({ text: `Requisitado por ${msg.author.tag}` });

    return msg.reply({ embeds: [embed] });
  }

  // Comando: !serverinfo
  if (msg.content === '!serverinfo') {
    const { guild } = msg;
    const embed = new EmbedBuilder()
      .setColor('#FF00FF')
      .setTitle(`Informações do Servidor: ${guild.name}`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: '👥 Membros', value: `${guild.memberCount}`, inline: true },
        { name: '👑 Dono', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Criado em', value: `${guild.createdAt.toLocaleDateString('pt-BR')}`, inline: true },
        { name: '📍 ID do Servidor', value: `${guild.id}`, inline: false }
      );
    
    return msg.reply({ embeds: [embed] });
  }

  // --- COMANDO DE IA (GROQ / LLAMA 3.3) ---
  if (msg.mentions.has(client.user)) {
    const pergunta = msg.content.replace(/<@!?[0-9]+>/g, '').trim();

    if (!pergunta) {
      return msg.reply("SENTIDO, RECRUTA! Deseja alguma instrução? Faça sua pergunta! 🪖");
    }

    try {
      await msg.channel.sendTyping();

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Você é um Instrutor do Exército Brasileiro no Roblox. Responda de forma disciplinada, curta, rígida e prestativa. Use termos militares como 'Recruta' e 'Senhor'. Proibido usar palavrões ou temas impróprios para menores de 15 anos."
          },
          {
            role: "user",
            content: pergunta
          }
        ],
        model: "llama-3.3-70b-versatile", // Modelo de alta capacidade da Groq
        temperature: 0.7,
        max_tokens: 500
      });

      const respostaIA = chatCompletion.choices[0].message.content;

      // Verifica limite de caracteres do Discord
      if (respostaIA.length > 2000) {
        return msg.reply(respostaIA.substring(0, 1900) + "\n\n*(Relatório cortado pelo alto comando)*");
      }

      return msg.reply(respostaIA);

    } catch (error) {
      console.error("Erro na Groq:", error);
      return msg.reply("❌ **NEGATIVO!** Falha na conexão com a base. Tente novamente mais tarde, recruta!");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

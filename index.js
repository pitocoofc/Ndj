const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
// --- CONFIGURAÇÃO DA IA (GOOGLE OFICIAL) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelIA = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash", // Modelo gratuito e rápido
});

// --- MINI SERVIDOR WEB PARA O RENDER ---
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
    return msg.channel.send(`🧹 Limpei **${amount}** mensagens!`)
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
    // --- COMANDO DE IA (Responde quando mencionado) ---
  if (msg.mentions.has(client.user)) {
    // 1. Limpa a mensagem: remove a menção do bot para enviar só o texto para a IA
    const pergunta = msg.content.replace(/<@!?[0-9]+>/g, '').trim();

    // Se o usuário só marcou o bot sem escrever nada
    if (!pergunta) {
      return msg.reply("Oi! Eu sou um bot com IA. Pode me perguntar qualquer coisa marcando meu nome! 🤖");
    }

    try {
      // 2. Mostra "Digitando..." no Discord para dar feedback ao usuário
      await msg.channel.sendTyping();

      // 3. Chama a OpenRouter
      const response = await openrouter.chat.send({
        model: "tngtech/deepseek-r1t2-chimera:free",
        messages: [
          { 
            role: "system", 
            content: "Você é um assistente de Discord amigável, zueiro e útil. Responda em português de forma concisa." 
          },
          { role: "user", content: pergunta }
        ],
      });

      const respostaIA = response.choices[0]?.message?.content || "Eita, o cérebro falhou aqui. Tenta de novo?";

      // 4. Verifica se a resposta cabe no limite de 2000 caracteres do Discord
      if (respostaIA.length > 2000) {
        const parte = respostaIA.substring(0, 1900);
        return msg.reply(`${parte}\n\n*(Resposta cortada por ser muito longa)*`);
      }

      return msg.reply(respostaIA);

    } catch (error) {
      console.error("Erro na OpenRouter:", error);
      return msg.reply("❌ Erro ao conectar com a IA. Verifique se a API Key está configurada no Render.");
    }
  }
  
});

client.login(process.env.DISCORD_TOKEN);

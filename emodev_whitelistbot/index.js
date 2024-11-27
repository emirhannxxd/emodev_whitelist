const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mysql = require('mysql2');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const db = mysql.createConnection({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  connectTimeout: 30000
});

client.commands = new Collection();
const commands = [
  {
    name: 'hex-ekle',
    description: 'Steam Hex ID ekle',
    options: [
      {
        name: 'steam_hex',
        type: 3,
        description: 'Eklenecek Steam Hex',
        required: true
      },
      {
        name: 'discord_id',
        type: 6,
        description: 'Kullanıcı',
        required: true
      }
    ]
  },
  {
    name: 'hex-cıkar',
    description: 'Steam Hex ID çıkar',
    options: [
      {
        name: 'steam_hex',
        type: 3,
        description: 'Çıkarılacak Steam Hex',
        required: true
      }
    ]
  },
  {
    name: 'hex-arat',
    description: 'Steam Hex ID ara',
    options: [
      {
        name: 'steam_hex',
        type: 3,
        description: 'Aranacak Steam Hex',
        required: true
      }
    ]
  },
  {
    name: 'discord-arat',
    description: 'Discord Hesabı İle Hex Ara',
    options: [
      {
        name: 'kullanıcı',
        type: 6,
        description: 'Aranacak Discord Hesabu',
        required: true
      }
    ]
  },
  {
    name: 'hex-listele',
    description: 'Tüm kayıtlı Steam Hex ID\'lerini listele',
  }  
];

process.on('unhandledRejection', (reason, promise) => {
    colorLog('red', 'İşlenmemiş Hata:', promise, 'sebep:', reason);
  });
  
  process.on('uncaughtException', (error) => {
    colorLog('red', 'Fark edilmemiş hata atıldı:', error);
});

const creatorTag = '[Author: emirhannxxd]';

function colorLog(color, message) {
  const colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[color]}[EMODEV-WHITELIST] ${message}${colors.reset}`);
}

client.on('ready', async () => {
  colorLog('blue', `${creatorTag}`);
  colorLog('green', `Bot ${client.user.tag} olarak giriş yaptı!`);

  const guild = client.guilds.cache.get(config.guildId);
  if (guild) {
    await guild.commands.set(commands);
    colorLog('blue', 'Komutlar yüklendi.');
  }

  db.connect((err) => {
    if (err) {
      colorLog('red', 'MySQL bağlantı hatası:');
      console.error(err);
    } else {
      colorLog('green', 'MySQL veritabanına bağlanıldı.');
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'hex-ekle') {
    let steamHex = options.getString('steam_hex');
    const discordMember = options.getUser('discord_id');
    const addedBy = interaction.user.id;

    if (!steamHex.startsWith('steam:')) {
        steamHex = 'steam:' + steamHex;
    }

    if (!interaction.member.roles.cache.has(config.yetkilirolid)) {
        return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
    }

    db.query(
        'SELECT * FROM emodev_whitelist WHERE steam_hex = ?',
        [steamHex],
        (err, results) => {
            if (err) {
                console.error('Veritabanı hatası (steam_hex kontrolü):', err);
                return interaction.reply({ content: 'Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
            }

            if (results.length > 0) {
                const existingUser = results[0];
                return interaction.reply({
                    content: `Bu Steam Hex zaten mevcut. Discord Hesabı: <@${existingUser.discord_id}>`,
                    ephemeral: true
                });
            }

            db.query(
                'SELECT * FROM emodev_whitelist WHERE discord_id = ?',
                [discordMember.id],
                (err, results) => {
                    if (err) {
                        console.error('Veritabanı hatası (discord_id kontrolü):', err);
                        return interaction.reply({ content: 'Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
                    }

                    if (results.length > 0) {
                        const existingSteamHex = results.map(result => result.steam_hex).join(', ');

                        return interaction.reply({
                            content: `Bu Discord Hesabı Zaten Mevcut. Eklenmiş Steam Hex'leri: ${existingSteamHex}`,
                            ephemeral: true
                        });
                    }

                    db.query(
                        'INSERT INTO emodev_whitelist (steam_hex, ekleyen, discord_id) VALUES (?, ?, ?)',
                        [steamHex, addedBy, discordMember.id],
                        (err) => {
                            if (err) {
                                console.error('Veritabanı hatası (ekleme işlemi):', err);
                                return interaction.reply({ content: 'Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
                            }
                            interaction.reply({ content: `Steam Hex: ${steamHex} başarıyla eklendi!` });
                        }
                    );
                }
            );
        }
    );
}

if (commandName === 'hex-cıkar') {
  let steamHex = options.getString('steam_hex');

  if (!steamHex.startsWith('steam:')) {
    steamHex = 'steam:' + steamHex;
  }

  if (!interaction.member.roles.cache.has(config.yetkilirolid)) {
    return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
  }

  db.query(
    'SELECT discord_id FROM emodev_whitelist WHERE steam_hex = ?',
    [steamHex],
    (err, results) => {
      if (err) {
        return interaction.reply({ content: 'Veritabanında bir hata oluştu.', ephemeral: true });
      }

      if (results.length === 0) {
        return interaction.reply({ content: 'Bu Steam Hex bulunamadı.', ephemeral: true });
      }

      const discordId = results[0].discord_id; 

      db.query(
        'DELETE FROM emodev_whitelist WHERE steam_hex = ?',
        [steamHex],
        (err, result) => {
          if (err || result.affectedRows === 0) {
            return interaction.reply({ content: 'Silme işlemi sırasında bir hata oluştu.', ephemeral: true });
          }
          interaction.reply({ content: `Steam Hex: ${steamHex} başarıyla silindi! Kayıtlı Discord Hesabı: <@${discordId}>` });
        }
      );
    }
  );
}

if (commandName === 'hex-arat') {
  let steamHex = options.getString('steam_hex');

  if (!steamHex.startsWith('steam:')) {
    steamHex = 'steam:' + steamHex;
  }

  db.query(
    'SELECT * FROM emodev_whitelist WHERE steam_hex = ?',
    [steamHex],
    (err, results) => {
      if (err || results.length === 0) {
        return interaction.reply({ content: 'Bu Steam Hex bulunamadı.', ephemeral: true });
      }

      const userInfo = results[0];

      const addedDate = new Date(userInfo.eklemetarih);
      const formattedDate = addedDate.toLocaleString('tr-TR', {
        timeZone: 'Europe/Istanbul',
        hour12: false
      });

      interaction.reply({
        content: `Bulunan Kayıt:\nSteam Hex: ${userInfo.steam_hex}\nWhitelist Ekleyen: <@${userInfo.ekleyen}>\nEklenen Discord Hesabı: <@${userInfo.discord_id}>\nEklendiği Tarih: ${formattedDate}`,
        ephemeral: true
      });
    }
  );
}

if (commandName === 'discord-arat') {
  const discordMember = options.getUser('kullanıcı');


  db.query(
    'SELECT * FROM emodev_whitelist WHERE discord_id = ?',
    [discordMember.id],
    (err, results) => {
      if (err || results.length === 0) {
        return interaction.reply({ content: 'Bu Discord ID ile kayıt bulunamadı.', ephemeral: true });
      }

      const userInfo = results[0];

      const addedDate = new Date(userInfo.eklemetarih);
      const formattedDate = addedDate.toLocaleString('tr-TR', {
        timeZone: 'Europe/Istanbul',
        hour12: false
      });

      interaction.reply({
        content: `Bulunan Kayıt:\nDiscord Hesabı: <@${userInfo.discord_id}>\nSteam Hex:${userInfo.steam_hex}\nWhitelist Ekleyen: <@${userInfo.ekleyen}>\nEklendiği Tarih: ${formattedDate}`,
        ephemeral: true
      });
    }
  );
}

if (commandName === 'hex-listele') {
  if (!interaction.member.roles.cache.has(config.yetkilirolid)) {
    return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
  }

  db.query(
    'SELECT discord_id, steam_hex, eklemetarih FROM emodev_whitelist',
    (err, results) => {
      if (err) {
        return interaction.reply({ content: 'Veritabanında bir hata oluştu.', ephemeral: true });
      }

      if (results.length === 0) {
        return interaction.reply({ content: 'Hiçbir kayıt bulunamadı.', ephemeral: true });
      }

      let messageContent = '';
      const maxMessageLength = 2000;
      const messages = [];

      results.forEach((userInfo) => {
        const addedAt = new Date(userInfo.eklemetarih);
        const options = {
          timeZone: 'Europe/Istanbul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        };
        const formattedDate = addedAt.toLocaleString('tr-TR', options);

        const line = `<@${userInfo.discord_id}> - Steam Hex: ${userInfo.steam_hex} - Eklendiği Zaman: ${formattedDate}\n`;
        if ((messageContent + line).length > maxMessageLength) {
          messages.push(messageContent);
          messageContent = line;
        } else {
          messageContent += line;
        }
      });

      if (messageContent.length > 0) {
        messages.push(messageContent);
      }

      interaction.reply({ content: messages[0], ephemeral: true });

      for (let i = 1; i < messages.length; i++) {
        interaction.followUp({ content: messages[i], ephemeral: true });
      }
    }
  );
}
});

client.login(config.token);
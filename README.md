
# Emodev Whitelist Bot & Script

**Emodev Whitelist Bot & Script** - Bu proje, Discord rol ve Steam Hex ile oyuncuları FiveM sunucunuzda whitelist yapmanıza olanak tanır. Whitelist Sistemimiz, oyuncu bağlantılarını denetler ve sadece belirli bir Discord rolüne sahip olan veya Steam Hex ID’si whitelist'te bulunan oyuncuların sunucunuza bağlanmasına izin verir.

## Özellikler
- **Discord Rol Tabanlı Whitelist**: Oyuncuların belirli bir Discord rolüne sahip olmalarını şart koşar.
- **Steam Hex Tabanlı Whitelist**: Steam ID’sine sahip oyuncular sadece sunucuya bağlanabilir.
- **Bot Komutları**: Adminlerin oyuncu whitelist işlemleri yapabilmesini sağlayan komutlar.
- **Dinamik Entegrasyon**: Discord ve Steam ID ile veri tabanı entegrasyonu.

## Başlangıç

Bu script ve botu kullanmak için aşağıdaki adımları takip edebilirsiniz.

### Gereksinimler
- **Discord Bot Token**: Discord botu için bir token gereklidir.
- **MySQL Veritabanı**: Oyuncu bilgilerini saklamak için MySQL veritabanı gereklidir.
- **FiveM Sunucusu**: Scripti çalıştırabileceğiniz bir FiveM sunucusu.
- **Node.js**: Projeyi çalıştırmak için Node.js gerekir.

### Kurulum

1. **Depoyu Klonlayın**
   ```bash
   git clone https://github.com/emirhannxxd/emodev_whitelist.git
   ```

2. **Bağımlılıkları Yükleyin**
   ```bash
   cd emodev_whitelist
   npm install
   ```

3. **config.json Düzenlemesi**
   `config.json` dosyasındaki gerekli yapılandırmaları yapın:
   ```json
   {
  "token": "BOT_TOKEN",
  "guildId": "SUNUCU_ID",
  "yetkilirolid": "YETKILI_ROL_ID",
  "mysql": {
    "host": "localhost",
    "user": "root",
    "password": "PASSWOARD_YOKSA_BOS_BIRAKIN",
    "database": "DATABASE_ISMI"
  }
   }
   ```

4. **Botu Başlatın**
   Botu başlatmak için:
   ```bash
   node index.js
   ```

5. **FiveM Sunucusuna Scripti Ekleyin**
   - Bu scripti FiveM sunucunuza entegre edin ve `resources` klasörüne koyun.
   - Sunucuya ait `config.lua` dosyasını aşağıdaki gibi düzenleyin:
     ```lua
     Settings = {
       botToken = "Discord Bot Token", 
       whitelistrolid = "Whitelist Rol ID", 
       guildId = "Sunucu ID",
       webhookUrl = "Server Giris Webhook Log",
     }
     ```

6. **Sunucuyu Başlatın**
   Sunucuyu başlatmak için:
   ```bash
   ensure emodev_whitelist
   ```

7. **Test Edin**
   Sunucuya bağlanan oyuncuların yalnızca whitelist’te bulunan oyunculara izin verildiğinden emin olun.

## Sorun Giderme

Eğer bir hata alırsanız:
- Consolda bütün hatalar loglanmaktadır.
- `config.json` dosyasını doğru yapılandırdığınızdan emin olun.
- Scriptin doğru yüklediğinizden emin olun.

## Katkıda Bulunma

Bu projeye katkıda bulunmak için:
1. Depoyu forklayın.
2. İstediğiniz değişiklikleri yapın.
3. Pull request gönderin.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.

### Gerekli Modüller

Projenin çalışması için aşağıdaki Node.js modüllerini kurmanız gerekmektedir:

1. **[discord.js](https://discord.js.org/):** Discord botunun işlevselliği için gereklidir.
2. **[mysql2](https://www.npmjs.com/package/mysql2):** MySQL veritabanı ile bağlantı ve işlemler için gereklidir.

#### Modülleri Yüklemek İçin:

Kurulum işlemleri sırasında aşağıdaki komutu çalıştırarak bu modülleri yükleyebilirsiniz:

```bash
npm install discord.js mysql2
```

#### Modüllerin İşlevi:
- **discord.js:** Discord API'lerini kullanarak botun sunucularla etkileşimde bulunmasını sağlar.
- **mysql2:** MySQL veritabanına bağlanma ve verileri okuma/yazma işlemleri için optimize edilmiş bir Node.js kütüphanesidir.
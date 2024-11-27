local kirmizi = "\x1b[31m"
local sifirla = "\x1b[0m"

Citizen.CreateThread(function()
    local ayarhata = {}

    if Settings["botToken"] == "" then
        table.insert(ayarhata, "botToken")
    end
    if Settings["whitelistrolid"] == "" then
        table.insert(ayarhata, "whitelistrolid")
    end
    if Settings["guildId"] == "" then
        table.insert(ayarhata, "guildId")
    end
    if Settings["webhookUrl"] == "" then
        table.insert(ayarhata, "webhookUrl")
    end

    if #ayarhata > 0 then
        print(kirmizi .. " Eksik Ayarlar: " .. table.concat(ayarhata, ", ") .. sifirla)
        print(kirmizi .. " Lütfen config.lua dosyasını kontrol edin!" .. sifirla)
    end
end)

function discordrolcheckle(discordId, callback)
    PerformHttpRequest("https://discord.com/api/guilds/" .. Settings["guildId"] .. "/members/" .. discordId, function(errorCode, resultData, resultHeaders)
        if errorCode == 200 then
            local memberData = json.decode(resultData)
            if memberData.roles then
                for _, roleId in ipairs(memberData.roles) do
                    if roleId == Settings["whitelistrolid"] then
                        callback(true)
                        return
                    end
                end
            end
            callback(false)
        else
            print("Discord API Hatası: " .. tostring(errorCode) .. " - " .. resultData)
            callback(false)
        end
    end, "GET", "", { ["Authorization"] = "Bot " .. Settings["botToken"] })
end

function steamhexcheckle(steamHex, callback)
    local query = "SELECT discord_id FROM emodev_whitelist WHERE steam_hex = ?"
    local params = { steamHex }

    exports.oxmysql:fetch(query, params, function(results)
        if results and #results > 0 then
            callback(true, results[1].discord_id)
        else
            print("MySQL Hatası: Sonuç alınamadı.")
            callback(false, nil)
        end
    end)
end

function webhookgonder(steamHex, discordId)
    local webhookUrl = Settings["webhookUrl"]
    local saat = os.date("!%Y-%m-%d %H:%M:%S")
    local ipadresi = GetPlayerIP(source)

    local webhookisim = "Emodev Whitelist Log"
    local webhookavatar = "https://i.ibb.co/kqYQ1kt/emodev.png"

    local embedayar = {
        username = webhookisim,
        avatar_url = webhookavatar,
        embeds = {
            {
                title = "Giriş Yapıldı",
                description = "Bir oyuncu giriş yaptı:",
                color = 3066993,
                fields = {
                    { name = "Steam Hex", value = steamHex or "Bilinmiyor", inline = true },
                    { name = "Discord ID", value = discordId and ("<@" .. discordId .. ">") or "Bulunamadı", inline = true },
                    { name = "Zaman", value = saat, inline = true },
                    { name = "IP Adresi", value = "||" .. (ipadresi or "Bulunamadı") .. "||", inline = true }
                },
                footer = {
                    text = "emodev_whitelist",
                },
                timestamp = saat,
            }
        }
    }

    PerformHttpRequest(webhookUrl, function(err, text, headers) end, "POST", json.encode(embedayar), { ["Content-Type"] = "application/json" })
end

AddEventHandler('playerConnecting', function(name, setCallback, deferrals)
    deferrals.defer()
    deferrals.update("[EMODEV-WHITELIST] Whitelist kontrol ediliyor...")

    local player = source
    local identifiers = GetPlayerIdentifiers(player)
    local discordId = nil
    local steamHex = nil

    for _, id in ipairs(identifiers) do
        if string.sub(id, 1, 8) == "discord:" then
            discordId = string.sub(id, 9)
        elseif string.sub(id, 1, 6) == "steam:" then
            steamHex = id
        end
    end

    Citizen.Wait(2000)

    if not steamHex then
        deferrals.done("[EMODEV-WHITELIST] Steam açık değil veya Steam Hex bulunamadı. Lütfen Steam'in açık olduğundan emin olun.")
        return
    end

    if discordId then
        discordrolcheckle(discordId, function(hasRole)
            if hasRole then
                deferrals.done()
                webhookgonder(steamHex, discordId)
            else
                steamhexcheckle(steamHex, function(isWhitelisted, fetchedDiscordId)
                    if isWhitelisted then
                        deferrals.done()
                        webhookgonder(steamHex, fetchedDiscordId)
                    else
                        deferrals.done("[EMODEV-WHITELIST] Discord Whitelist Rolün Yok Veya Steam Hex Kayıtlı Değil.")
                    end
                end)
            end
        end)
    else
        steamhexcheckle(steamHex, function(isWhitelisted)
            if isWhitelisted then
                deferrals.done()
                webhookgonder(steamHex, discordId)
            else
                deferrals.done("[EMODEV-WHITELIST] Discord ID bulunamadı ve Steam Hex kayıtlı değil.")
            end
        end)
    end
end)
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");

// Konfigurasi
const allowed_admin_keywords = ["Admin", "RASYID SMB TALPO DC"];
const allowed_group_names = ["DW SMB GEN 7 (TALPO)"];
const trigger_prefix = "*REQ DW SMB";
const reply_text = "M Wahyu Ramadhan 1431667";

// Inisialisasi client WhatsApp (headless)
const client = new Client({
  puppeteer: { headless: true }
});

client.on("qr", (qr) => {
  console.log("📌 Scan QR Code ini di WhatsApp Web:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp Bot siap! Monitoring pesan di grup tertentu...");
});

client.on("message", async (msg) => {
  try {
    if (msg.fromMe) return;

    const chat = await msg.getChat();
    const isGroup = chat.isGroup;
    const groupName = isGroup ? chat.name : null;
    const senderName = msg._data.notifyName || msg.author?.split("@")[0] || "Unknown";

    console.log(`📩 Pesan dari: ${senderName} | Grup: ${groupName || "Pribadi"} | Teks: ${msg.body}`);

    if (!isGroup || !allowed_group_names.some(name => groupName.toLowerCase().includes(name.toLowerCase()))) return;
    if (!allowed_admin_keywords.some(admin => senderName.toLowerCase().includes(admin.toLowerCase()))) return;
    if (!msg.body.toLowerCase().startsWith(trigger_prefix.toLowerCase())) return;

    // Delay auto-reply
    const delay = Math.random() * 150 + 50;
    setTimeout(async () => {
      await msg.reply(reply_text);
      console.log("✅ Auto-reply terkirim!");
    }, delay);
  } catch (err) {
    console.error("❌ Error menangani pesan:", err);
  }
});

// Jalankan client
client.initialize();

// Express server untuk Railway ping
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot aktif!"));
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));

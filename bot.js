const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");

// Konfigurasi
const allowed_admin_keywords = ["Admin", "RASYID SMB TALPO DC"]; // Nama admin (case-insensitive)
const allowed_group_names = ["DW SMB GEN 7 (TALPO)"]; // Nama grup yang diinginkan (case-insensitive, tambah lebih banyak jika perlu)
const trigger_prefix = "*REQ DW SMB"; // Prefix trigger (case-insensitive, pesan harus dimulai dengan ini)
const reply_text = "M Wahyu Ramadhan 1431667"; // Teks balasan otomatis

// Inisialisasi client WhatsApp
const client = new Client();

// Event: Ketika QR code siap (untuk scan)
client.on("qr", (qr) => {
  console.log("📌 Scan QR Code ini di WhatsApp Web:");
  qrcode.generate(qr, { small: true });
});

// Event: Ketika client siap
client.on("ready", () => {
  console.log("✅ WhatsApp Bot siap! Monitoring pesan di grup tertentu...");
});

// Event: Ketika menerima pesan
client.on("message", async (msg) => {
  // Lewati pesan dari diri sendiri
  if (msg.fromMe) return;

  // Ambil info chat (untuk cek apakah grup)
  const chat = await msg.getChat();
  const isGroup = chat.isGroup;
  const groupName = isGroup ? chat.name : null;

  // Ambil info pengirim
  const senderName =
    msg._data.notifyName || msg.author?.split("@")[0] || "Unknown";

  console.log(
    `📩 Pesan dari: ${senderName} | Grup: ${groupName || "Pribadi"} | Teks: ${
      msg.body
    }`
  );

  // Cek 1: Hanya di grup yang diinginkan
  if (
    !isGroup ||
    !allowed_group_names.some((name) =>
      groupName.toLowerCase().includes(name.toLowerCase())
    )
  ) {
    console.log(`   ➤ Lewati: Bukan grup yang diinginkan (${groupName}).`);
    return;
  }

  // Cek 2: Apakah pengirim adalah admin berdasarkan nama (case-insensitive)
  const isAdmin = allowed_admin_keywords.some((admin) =>
    senderName.toLowerCase().includes(admin.toLowerCase())
  );
  if (!isAdmin) {
    console.log(`   ➤ Lewati: Pengirim '${senderName}' bukan admin.`);
    return;
  }

  // Cek 3: Apakah pesan dimulai dengan trigger prefix (case-insensitive, lalu kalimat fleksibel)
  if (!msg.body.toLowerCase().startsWith(trigger_prefix.toLowerCase())) {
    console.log(`   ➤ Lewati: Pesan tidak dimulai dengan '${trigger_prefix}'.`);
    return;
  }

  console.log(
    "   ➤ Trigger terdeteksi di grup admin! Menyiapkan auto-reply..."
  );

  // Delay dipercepat: 0.05-0.2 detik (acak untuk menghindari deteksi bot)
  const delay = Math.random() * 150 + 50; // Lebih cepat dari sebelumnya
  setTimeout(async () => {
    await msg.reply(reply_text);
    console.log("✅ Auto-reply terkirim!");
  }, delay);
});

// Inisialisasi bot
client.initialize();

// Express server untuk Railway ping
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot aktif!"));
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));

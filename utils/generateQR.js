const QRCode = require("qrcode");
const path = require("path");

async function generateQRCode(name, expiryDate) {
  const text = `Product: ${name}\nExpiry: ${expiryDate}`;
  const filename = `${name}_${Date.now()}.png`;
  const filepath = path.join(__dirname, "../qr-codes", filename);
  await QRCode.toFile(filepath, text);
  return filepath;
}

module.exports = generateQRCode;

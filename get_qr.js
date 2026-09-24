const fs = require('fs');
const path = require('path');

async function getQR() {
  const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://api-wa.kostiv-mea.com';
  const apiKey = process.env.EVOLUTION_API_KEY || '';
  if (!apiKey) {
    console.error('Missing EVOLUTION_API_KEY environment variable');
    return;
  }

  try {
    const res = await fetch(`${evolutionUrl}/instance/connect/sixtenet-marketing`, {
      headers: { 'apikey': apiKey }
    });
    const data = await res.json();
    const base64 = data.base64 || (data.qrcode && data.qrcode.base64);
    if (base64) {
      const cleanBase64 = base64.replace(/^data:image\/png;base64,/, '');
      const filePath = path.join(__dirname, 'sixtenet_qr.png');
      fs.writeFileSync(filePath, cleanBase64, 'base64');
      console.log('Fresh QR Code saved to:', filePath);
    } else {
      console.log('Response state:', data);
    }
  } catch (err) {
    console.error('Error fetching QR:', err.message);
  }
}

getQR();

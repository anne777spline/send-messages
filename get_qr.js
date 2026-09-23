const fs = require('fs');
const path = require('path');

async function getQR() {
  try {
    const res = await fetch('https://api-wa.kostiv-mea.com/instance/connect/sixtenet-marketing', {
      headers: { 'apikey': 'Marketing@123' }
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

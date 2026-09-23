const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const res = await fetch('https://api-wa.kostiv-mea.com/instance/connect/broker-landlords', {
      headers: { 'apikey': 'Marketing@123' }
    });
    const data = await res.json();
    if (data.base64) {
      const base64Data = data.base64.replace(/^data:image\/png;base64,/, '');
      const filePath = path.join(__dirname, 'broker_qr.png');
      fs.writeFileSync(filePath, base64Data, 'base64');
      console.log('QR Code saved successfully to:', filePath);
    } else {
      console.log('No base64 returned. Instance state:', data);
    }
  } catch (err) {
    console.error('Error fetching QR:', err.message);
  }
}

main();

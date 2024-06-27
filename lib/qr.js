const path = require('path');

const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fs = require('fs'); 

// Ensure the 'qrcodes' directory exists
const qrCodeDir = path.join(__dirname, '../public', 'images', 'qr-codes'); 
if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir);
}

const qrCode = {
    generate: async(uuid) => {
        const uniqueUrl = `${process.env.NODE_QR_BASE_URL}/user/qr-info/${uuid}`;
         
        // Generate QR code
        const qrCodePath = path.join(qrCodeDir, `${uuid}.png`);
        await QRCode.toFile(qrCodePath, uniqueUrl, {
            width: 500,
            height: 500,
            color: {
              dark: '#000000ff',
              light: '#0000'
            }  
          },); 
        return `/images/qr-codes/${uuid}.png`; 
    },
    delete: (uuid) => {
        const qrCodePath = path.join(qrCodeDir, `${uuid}.png`);
        
        // Check if the file exists before attempting to delete it
        if (fs.existsSync(qrCodePath)) {
            fs.unlinkSync(qrCodePath);
            return true;
        } else {
            return false;
        }
    } 
} 
 
module.exports = qrCode;
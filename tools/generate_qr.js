
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

const url = 'http://localhost:5173';
const outputPath = path.join('public', 'qr.png');

QRCode.toFile(outputPath, url, {
    color: {
        dark: '#000000',
        light: '#ffffff'
    },
    width: 512
}, function (err) {
    if (err) throw err;
    console.log(`QR code generated for ${url} and saved to ${outputPath}`);
});

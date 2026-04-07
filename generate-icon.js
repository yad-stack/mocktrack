const fs = require('fs');
// Creates a minimal valid 1x1 PNG (will be stretched but won't crash the build)
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/icon.png', PNG);
fs.writeFileSync('assets/splash.png', PNG);
fs.writeFileSync('assets/adaptive-icon.png', PNG);
console.log('Assets created!');
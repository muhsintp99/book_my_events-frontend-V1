const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/dropdevrahul/pincodes-india/main/pincode.csv';
const outputFile = 'kerala_full_pincodes.csv';

console.log('Downloading all-india pincode file...');

https.get(url, (res) => {
    let data = '';
    let headers = '';
    let buffer = '';

    res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');

        // Save the last partial line back to the buffer
        buffer = lines.pop();

        if (!headers && lines.length > 0) {
            headers = lines.shift();
            fs.writeFileSync(outputFile, headers + '\n');
        }

        const keralaLines = lines.filter(line => line.toLowerCase().includes('"kerala"'));
        if (keralaLines.length > 0) {
            fs.appendFileSync(outputFile, keralaLines.join('\n') + '\n');
        }
    });

    res.on('end', () => {
        // Handle final partial line in buffer
        if (buffer.toLowerCase().includes('"kerala"')) {
            fs.appendFileSync(outputFile, buffer + '\n');
        }
        console.log('Finished! Kerala-only file created: ' + outputFile);
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});

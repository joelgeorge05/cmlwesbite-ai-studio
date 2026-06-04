
const https = require('https');
const fs = require('fs');

function downloadImage(query, filename) {
  const url = 'https://duckduckgo.com/html/?q=' + encodeURIComponent(query + ' filetype:jpg');
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        // Find the first image source
        const match = data.match(/src="([^"]+\.jpg)"/i) || data.match(/src="(\/\/external-content[^"]+)"/i) || data.match(/src="([^"]+)"/i);
        console.log('Match for', query, match ? match[1] : 'none');
    });
  });
}

downloadImage('Fr. Joseph Maliparambil CML', 'src/assets/images/real_founder_priest.jpg');


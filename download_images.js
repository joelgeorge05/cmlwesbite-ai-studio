
const https = require('https');
const fs = require('fs');

function downloadImage(query, filename) {
  const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query);
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const match = data.match(/murl&quot;:&quot;(https:\/\/[^&quot;]+)/);
      if (match && match[1]) {
        console.log('Found image for', query, ':', match[1]);
        https.get(match[1], (imgRes) => {
          if (imgRes.statusCode === 200 || imgRes.statusCode === 301 || imgRes.statusCode === 302) {
             const finalUrl = imgRes.headers.location || match[1];
             https.get(finalUrl, (finalRes) => {
                const file = fs.createWriteStream(filename);
                finalRes.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log('Downloaded', filename);
                });
             }).on('error', err => console.error(err));
          } else {
              const file = fs.createWriteStream(filename);
              imgRes.pipe(file);
              file.on('finish', () => {
                  file.close();
                  console.log('Downloaded', filename);
              });
          }
        }).on('error', (err) => console.error('Failed downloading image:', err));
      } else {
        console.log('No image found for', query);
      }
    });
  }).on('error', (err) => {
    console.error('Failed searching:', err);
  });
}

downloadImage('Fr. Joseph Maliparambil Cherupushpa', 'src/assets/images/real_founder_priest.jpg');
downloadImage('P C Abraham Kunjettan Cherupushpa', 'src/assets/images/real_founder_layman.jpg');


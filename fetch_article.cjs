
const https = require('https');
https.get('https://www.cmlthalassery.org/FoundingFathers', (res) => {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => {
        const matches = data.match(/<img[^>]+src=["']([^"']+)["']/g);
        if(matches) {
            matches.forEach(m => console.log(m));
        }
    });
});


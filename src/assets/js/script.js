console.log("Static site loaded!");
const sitemap = require('sitemap');
const sm = sitemap.createSitemap({
    hostname: 'https://yourdomain.com',
    urls: [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/about/', changefreq: 'monthly', priority: 0.8 }
    ]
});

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sm.toString());

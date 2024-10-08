const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { marked } = require('marked');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');

// Directories
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const templatesDir = path.join(__dirname, 'templates');
const contentDir = path.join(__dirname, 'content');
const assetsDir = path.join(__dirname, 'src/assets');
const siteUrls = []; // Store URLs for sitemap

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Copy assets
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);

    files.forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);

        if (fs.lstatSync(srcFile).isDirectory()) {
            copyDirectory(srcFile, destFile);
        } else {
            fs.copyFileSync(srcFile, destFile);
        }
    });
}

copyDirectory(assetsDir, path.join(distDir, 'assets'));

// Generate pages from markdown
function generatePage(markdownFile, outputDir) {
    const markdownContent = fs.readFileSync(markdownFile, 'utf-8');
    const htmlContent = marked(markdownContent);

    const data = {
        title: "My Static Site",
        description: "This is a description sample",
        content: htmlContent
    };

    try {
        const templatePath = path.join(templatesDir, 'index.ejs');
        const template = fs.readFileSync(templatePath, 'utf-8');
        const renderedHtml = ejs.render(template, data, { 
            views: [templatesDir] // Tell EJS where to look for includes
        });
        fs.writeFileSync(path.join(outputDir, 'index.html'), renderedHtml);
        console.log(`Page generated and saved to ${outputDir}`);
    } catch (error) {
        console.log('Error generating page:', error);
    }
}

// Recursively generate all pages
function generateAllPages(dir, outputDir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const outputItemDir = path.join(outputDir, item.replace('.md', ''));

        if (fs.lstatSync(itemPath).isDirectory()) {
            generateAllPages(itemPath, outputItemDir);
        } else if (path.extname(itemPath) === '.md') {
            if (!fs.existsSync(outputItemDir)) {
                fs.mkdirSync(outputItemDir, { recursive: true });
            }
            const route = `/${path.relative(contentDir, itemPath).replace('.md', '.html')}`;
            // Store this route for sitemap generation later
            siteUrls.push({ url: route, changefreq: 'monthly', priority: 0.8 });
            generatePage(itemPath, outputItemDir);
        }
    });
}

// Generate sitemap
async function generateSitemap() {
    const smStream = new SitemapStream({ hostname: 'https://binesh-b0.github.io/static-site-generator/' });
    const writeStream = createWriteStream(path.join(distDir, 'sitemap.xml'));

    smStream.pipe(writeStream);

    siteUrls.forEach(url => smStream.write(url));

    smStream.end();

    await streamToPromise(smStream);
    console.log('Sitemap generated and saved to dist/sitemap.xml');
}

const plugins = [];

function registerPlugin(plugin) {
    plugins.push(plugin);
}

function runPlugins() {
    plugins.forEach(plugin => plugin());
}

// Example of registering and running a plugin
registerPlugin(() => {
    console.log("Running custom plugin...");
    // Custom plugin code
});

runPlugins();

// Generate the website and sitemap
generateAllPages(contentDir, distDir);

generateSitemap().catch(console.error);

// Copy other static files
function copyStaticFiles() {
    fs.readdirSync(srcDir).forEach(file => {
        const srcFile = path.join(srcDir, file);
        const distFile = path.join(distDir, file);
        if (fs.lstatSync(srcFile).isDirectory()) {
            copyDirectory(srcFile, distFile);
        } else {
            fs.copyFileSync(srcFile, distFile);
        }
        console.log(`${file} copied to dist`);
    });
}

copyStaticFiles();

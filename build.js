const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { marked } = require('marked');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const templatesDir = path.join(__dirname, 'templates');
const contentDir = path.join(__dirname, 'content');
const assetsDir = path.join(__dirname, 'src/assets');

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

// Read and convert Markdown content
const markdownContent = fs.readFileSync(path.join(contentDir, 'index.md'), 'utf-8');
const htmlContent = marked(markdownContent);

// Data for rendering
const data = {
    title: "My Static Site",
    description: "This is a description sample",
    content: htmlContent
};

// Render the EJS template
const templatePath = path.join(templatesDir, 'index.ejs');
if (!fs.existsSync(templatePath)) {
    console.error('Template file not found:', templatePath);
    process.exit(1);
}

// Copy files from src to dist
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

// rendering index.html and saving
try {
    const template = fs.readFileSync(templatePath, 'utf-8');
    const renderedHtml = ejs.render(template, data);
    fs.writeFileSync(path.join(distDir, 'index.html'), renderedHtml);
    console.log('index.html rendered and saved in dist');
} catch (error) {
    console.error('Error reading or rendering template:', error);
    process.exit(1);
}

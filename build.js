const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const templatesDir = path.join(__dirname, 'templates');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Data for rendering
const data = {
    title: "My Static Site",
    description: "This is a description sample"
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
    fs.copyFileSync(srcFile, distFile);
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


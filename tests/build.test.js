const fs = require('fs');
const { execSync } = require('child_process');

test('Build script runs successfully', () => {
    execSync('node build.js');
    const files = fs.readdirSync('./dist');
    expect(files).toContain('index.html');
});

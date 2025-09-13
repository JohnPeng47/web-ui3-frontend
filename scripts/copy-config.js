// Copies public/config.json into the build directory root after CRA build
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const src = path.join(root, 'public', 'config.json');
const destDir = path.join(root, 'build');
const dest = path.join(destDir, 'config.json');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Copied config.json to build/config.json');
  } else {
    console.warn('public/config.json not found; skipping copy');
  }
} catch (err) {
  console.error('Failed to copy config.json:', err);
  process.exitCode = 1;
}



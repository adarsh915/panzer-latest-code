const fs = require('fs');
const path = 'e:/allproject/panjerIT-backend/backend-panzer/src/app/(frontend)/style.css';
let content = fs.readFileSync(path, 'utf8');

// The CSS file might have unclosed quotes if we replaced it carelessly, so let's be safe.
// We'll capture any potential quote and replace it securely.
content = content.replace(/url\(\s*['"]?\.\.\/images\/(.*?)['"]?\s*\)/g, "url('/assets/images/$1')");
content = content.replace(/url\(\s*['"]?\.\.\/fonts\/(.*?)['"]?\s*\)/g, "url('/assets/fonts/$1')");
content = content.replace(/url\(\s*['"]?\.\.\/webfonts\/(.*?)['"]?\s*\)/g, "url('/assets/webfonts/$1')");

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully fixed relative paths in style.css');

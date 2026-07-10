const fs = require('fs');

const content = fs.readFileSync('public/assets/css/style.css', 'utf8');
const hexRegex = /#[0-9a-fA-F]{3,6}\b/g;

const matches = content.match(hexRegex);
const counts = {};

if (matches) {
    matches.forEach(color => {
        const c = color.toLowerCase();
        counts[c] = (counts[c] || 0) + 1;
    });
}

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
console.log("Top 15 Hex Colors in style.css:");
sorted.slice(0, 15).forEach(([color, count]) => {
    console.log(`${color}: ${count} times`);
});

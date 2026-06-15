const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('e:/website-project/penzarit/backend/TS/src');
let changed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /import\s+ReactApexChart\s+from\s+['"]react-apexcharts['"];?/g;
    if (regex.test(content)) {
        content = content.replace(regex, "import dynamic from 'next/dynamic';\nconst ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });");
        fs.writeFileSync(file, content);
        changed++;
        console.log('Fixed ' + file);
    }
});
console.log('Total files changed: ' + changed);

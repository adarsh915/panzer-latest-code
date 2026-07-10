const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    path.join(__dirname, 'public/assets/css/style.css'),
    path.join(__dirname, 'src/app/(frontend)/style.css')
];

let changedFiles = 0;

filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        const lines = content.split('\n');
        let inRootBlock = false;
        let newLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            if (line.includes(':root {')) {
                inRootBlock = true;
            }
            
            if (inRootBlock) {
                // If the line defines a variable we already manage in globals.css, skip it
                if (line.includes('--theme-color:') ||
                    line.includes('--theme-navy-dark:') ||
                    line.includes('--theme-blue-light:') ||
                    line.includes('--theme-navy-darker:') ||
                    line.includes('--theme-blue-medium:') ||
                    line.includes('--theme-navy-medium:') ||
                    line.includes('--theme-blue-bright:') ||
                    line.includes('--theme-navy-slate:') ||
                    line.includes('--theme-navy-deep:') ||
                    line.includes('--theme-navy-slate-light:') ||
                    line.includes('--theme-blue-dark:') ||
                    line.includes('--dark-color3:')) {
                    console.log(`Removed from ${file}: ${line.trim()}`);
                    continue; // skip adding this line
                }
            }
            
            if (inRootBlock && line.includes('}')) {
                inRootBlock = false;
            }
            
            newLines.push(line);
        }
        
        const newContent = newLines.join('\n');
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            changedFiles++;
        }
    }
});

console.log(`\nDone! Fixed ${changedFiles} files.`);

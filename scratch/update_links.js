const fs = require('fs');
const execSync = require('child_process').execSync;

const files = execSync('dir /s /b src\\*.tsx src\\*.ts src\\*.js').toString().trim().split('\r\n');
console.log('Total files:', files.length);

const toReplace = [
  { match: /"\/solution-details/g, replace: '"/solution' },
  { match: /'\/solution-details/g, replace: "'/solution" },
  { match: /`\/solution-details/g, replace: '`/solution' },
  { match: /"\/brand-detail/g, replace: '"/brand' },
  { match: /'\/brand-detail/g, replace: "'/brand" },
  { match: /`\/brand-detail/g, replace: '`/brand' },
  { match: /"\/blog-grid/g, replace: '"/blog' },
  { match: /'\/blog-grid/g, replace: "'/blog" },
  { match: /`\/blog-grid/g, replace: '`/blog' },
  { match: /"\/blog-details/g, replace: '"/blog' },
  { match: /'\/blog-details/g, replace: "'/blog" },
  { match: /`\/blog-details/g, replace: '`/blog' }
];

let changedFiles = [];
files.forEach(f => {
  let file = f.trim();
  if (file && fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    toReplace.forEach(r => {
      newContent = newContent.replace(r.match, r.replace);
    });
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      changedFiles.push(file);
    }
  }
});
console.log('Changed files:', changedFiles.length);

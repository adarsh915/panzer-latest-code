const fs = require('fs');
const content = fs.readFileSync('src/components/frontend/SolutionsGrid.tsx', 'utf8');
const r = { match: /`\/solution-details/g, replace: '`/solution' };
console.log(content.includes('`/solution-details'));
console.log(r.match.test(content));

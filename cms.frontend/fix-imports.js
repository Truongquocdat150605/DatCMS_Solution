const fs = require('fs');
const path = require('path');

const pagesDir = 'src/pages';
const dirs = fs.readdirSync(pagesDir);

dirs.forEach(d => {
  const dPath = path.join(pagesDir, d);
  if (fs.statSync(dPath).isDirectory()) {
    const files = fs.readdirSync(dPath);
    files.forEach(f => {
      if (f.endsWith('.js')) {
        const fPath = path.join(dPath, f);
        let content = fs.readFileSync(fPath, 'utf8');
        content = content.replace(/from\s+['"]\.\.\//g, "from '../../");
        content = content.replace(/import\s+['"]\.\.\//g, "import '../../");
        fs.writeFileSync(fPath, content);
      }
    });
  }
});
console.log('Done replacing imports');

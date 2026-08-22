import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:/UnBwnd/admin_panel_web/src');
files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.jsx')) {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('https://unbwnd-backned1.onrender.com')) {
            // Replace literal string
            content = content.replace(/'https:\/\/unbwnd-backned1\.onrender\.com/g, 'import.meta.env.VITE_API_URL + \'');
            content = content.replace(/`https:\/\/unbwnd-backned1\.onrender\.com/g, '`${import.meta.env.VITE_API_URL}');
            // Special cases where it's concatenated without trailing slash
            content = content.replace(/import\.meta\.env\.VITE_API_URL \+ '\/api/g, '`${import.meta.env.VITE_API_URL}/api');
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
});

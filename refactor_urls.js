const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('https://unbwnd-backned1.onrender.com')) {
                // Ensure import.meta.env is used
                content = content.replace(/'https:\/\/unbwnd-backned1\.onrender\.com/g, 'import.meta.env.VITE_API_URL + \'');
                content = content.replace(/"https:\/\/unbwnd-backned1\.onrender\.com/g, 'import.meta.env.VITE_API_URL + "');
                content = content.replace(/https:\/\/unbwnd-backned1\.onrender\.com/g, '${import.meta.env.VITE_API_URL}');
                
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

replaceInDir('d:/UnBwnd/admin_panel_web/src');

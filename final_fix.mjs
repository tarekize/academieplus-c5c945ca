import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const replacements = [
        { old: /prÃ©cÃ©dent/g, new: 'précédent' },
        { old: /GÃ©nÃ©rer/g, new: 'Générer' },
        { old: /Ø¨Ø·Ø§Ù‚Ø§Øª Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø®Ø§ØµØ© Ø¨Ø§Ù„Ø¯Ø±Ø³ Ù…ØªÙˆÙØ±Ø© ÙÙŠ Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø°ÙƒÙŠ Ø£Ø¹Ù„Ø§Ù‡/g, new: 'بطاقات المراجعة الخاصة بالدرس متوفرة في القسم الذكي أعلاه.' },
        { old: /ذكاء اصطnaعي/g, new: 'ذكاء اصطناعي' },
        { old: /LeÃ§on suivante/g, new: 'Leçon suivante' },
        { old: /LeÃ§on prÃ©cÃ©dente/g, new: 'Leçon précédente' }
    ];

    replacements.forEach(r => {
        if (r.old.test(content)) {
            content = content.replace(r.old, r.new);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.json')) {
            fixFile(fullPath);
        }
    });
}

walk(path.resolve(process.cwd(), 'src'));
console.log('Final fix complete.');

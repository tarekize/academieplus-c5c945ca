import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const replacements = [
        { old: /Ø§ÙƒØªØ´Ù/g, new: 'اكتشف' },
        { old: /Ø§ÙÙ‡Ù…/g, new: 'افهم' },
        { old: /ØªØ¹Ù…Ù‘Ù‚/g, new: 'تعمّق' },
        { old: /ØªÙ…Ø§Ø±ÙŠÙ†/g, new: 'تمارين' },
        { old: /Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª/g, new: 'اسئله متعدده الاختيارات' },
        { old: /Ø¥Ø¬Ø§Ø¨Ø§Øª ØµØ­ÙŠØ­Ø©/g, new: 'إجابات صحيحة' },
        { old: /Ø¹Ø±Ø¶ Ø§Ù„Ø­Ù„/g, new: 'عرض الحل' },
        { old: /ØªØ­Ù‚Ù‚/g, new: 'تحقق' },
        { old: /Ø£Ø¯Ø®Ù„ Ø¥Ø¬Ø§Ø¨ØªÙƒ/g, new: 'أدخل إجابتك' },
        { old: /Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ/g, new: 'ذكاء اصطnaعي' },
        { old: /Ø§Ù„Ø¯Ø±ÙˆØ³/g, new: 'الدروس' },
        { old: /DÃ©couvrir/g, new: 'Découvrir' },
        { old: /RÃ©vision/g, new: 'Révision' },
        { old: /LeÃ§on/g, new: 'Leçon' },
        { old: /Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ/g, new: 'ذكاء اصطناعي' },
        { old: /ÙÙ‡Ø±Ø³ Ø§Ù„Ù…Ø­ØªÙˆÙŠØ§Øª/g, new: 'فهرس المحتويات' },
        { old: /Ø¥Ø¬Ø§Ø¨Ø§Øª ØµØ­ÙŠØ­Ø©/g, new: 'إجابات صحيحة' },
        { old: /Ù…Ø¬Ù…ÙˆØ¹Ø© Ø¬Ø¯ÙŠØ¯Ø©/g, new: 'مجموعة جديدة' },
        { old: /ØªÙ…Ø§Ø±ÙŠÙ† Ù…ØªÙ‚Ø¯Ù…Ø©/g, new: 'تمارين متقدمة' },
        { old: /Ø§Ø¶ØºØ· Ø¹Ù„Ù‰ Ø§Ù„Ø²Ø± Ø£Ø¯Ù†Ø§Ù‡/g, new: 'اضغط على الزر أدناه' },
        { old: /Ø¥Ø¯Ø§Ø±Ø©/g, new: 'إدارة' },
        { old: /Ø£Ø³Ø¦Ù„Ø©/g, new: 'أسئلة' }
    ];

    let fixedContent = content;
    replacements.forEach(r => {
        fixedContent = fixedContent.replace(r.old, r.new);
    });

    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`Fixed: ${filePath}`);
}

const targetFiles = [
    'src/components/course/LessonActivityTabs.tsx',
    'src/components/course/AdaptiveActivities.tsx',
    'src/components/course/LessonEditorActivities.tsx',
    'src/i18n/locales/ar.json'
];

targetFiles.forEach(f => fixFile(path.resolve(process.cwd(), f)));

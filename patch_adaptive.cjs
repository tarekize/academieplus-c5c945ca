const fs = require('fs');

let file = 'src/components/course/AdaptiveActivities.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Replace {ex.statement}
txt = txt.replace(
    /<p className="text-sm" dir="rtl">\{ex\.statement\}<\/p>/g,
    '<HtmlWithMath htmlContent={ex.statement} className="text-sm" dir="rtl" />'
);

// Replace {ex.title}
txt = txt.replace(
    /<h4 className="font-semibold" dir="rtl">\{idx \+ 1\}\. \{ex\.title\}<\/h4>/g,
    '<h4 className="font-semibold flex gap-2" dir="rtl"><span className="shrink-0">{idx + 1}.</span> <HtmlWithMath htmlContent={ex.title} className="flex-1" /></h4>'
);

// Replace ex.solution
txt = txt.replace(
    /\{ex\.solution && \(\n\s*<div className="bg-muted p-3 rounded-lg text-sm" dir="rtl">\n\s*<span className="font-bold">Ø§Ù„ØÙ„: <\/span>\n\s*\{ex\.solution\}\n\s*<\/div>\n\s*\)\}/g,
    `{ex.solution && (
                        <div className="bg-muted p-3 rounded-lg text-sm flex gap-2 items-start" dir="rtl">
                          <span className="font-bold shrink-0">Ø§Ù„ØÙ„: </span>
                          <HtmlWithMath htmlContent={ex.solution} className="flex-1" />
                        </div>
                      )}`
);

// Check if it's there
txt = txt.replace(
    /\{ex\.solution && \(\n\s*<div className="bg-muted p-3 rounded-lg text-sm" dir="rtl">\n\s*<span className="font-bold">الحل: <\/span>\n\s*\{ex\.solution\}\n\s*<\/div>\n\s*\)\}/g,
    `{ex.solution && (
                        <div className="bg-muted p-3 rounded-lg text-sm flex gap-2 items-start" dir="rtl">
                          <span className="font-bold shrink-0">الحل: </span>
                          <HtmlWithMath htmlContent={ex.solution} className="flex-1" />
                        </div>
                      )}`
);

// Also replace raw solution
txt = txt.replace(
    /<span className="font-bold">الحل: <\/span>\n\s*\{ex\.solution\}/g,
    '<span className="font-bold shrink-0">الحل: </span>\n                          <HtmlWithMath htmlContent={ex.solution} className="flex-1" />'
);

txt = txt.replace(
    /<span className="font-bold">Ø§Ù„ØÙ„: <\/span>\n\s*\{ex\.solution\}/g,
    '<span className="font-bold shrink-0">Ø§Ù„ØÙ„: </span>\n                          <HtmlWithMath htmlContent={ex.solution} className="flex-1" />'
);

txt = txt.replace(
    /<div className="bg-muted p-3 rounded-lg text-sm" dir="rtl">\n\s*<span className="font-bold">Ø§Ù„ØÙ„:/g,
    '<div className="bg-muted p-3 rounded-lg text-sm flex gap-2 items-start" dir="rtl">\n                          <span className="font-bold shrink-0">Ø§Ù„ØÙ„:'
);

txt = txt.replace(
    /<div className="bg-muted p-3 rounded-lg text-sm" dir="rtl">\n\s*<span className="font-bold">الحل:/g,
    '<div className="bg-muted p-3 rounded-lg text-sm flex gap-2 items-start" dir="rtl">\n                          <span className="font-bold shrink-0">الحل:'
);

fs.writeFileSync(file, txt);
console.log('Patched AdaptiveActivities.tsx');

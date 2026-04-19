import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://lfothlxoixayjiytwwqa.supabase.co',
    'sb_secret_TfGn3PzkQ1F66J9cr3K2hQ_0gVO2jQb'
);

async function main() {
    const { data, error } = await supabase
        .from('lessons')
        .select('id, title_ar, content')
        .like('content', '%الدالة%f(x)%')
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    for (let lesson of data) {
        if (lesson.title_ar.includes("نهاية") || lesson.title_ar.includes("انهاية")) {
            console.log("Found lesson:", lesson.id, lesson.title_ar);

            const newHtml = `
<div style="direction: rtl; font-family: 'Tajawal', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مثال تطبيقي للتدريب</h2>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #3498db; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9; font-size: 1.1em;">📝 التمرين:</strong><br/>
لتكن الدالة $f$ المعرفة بـ:
$$ f(x) = \\frac{1}{x} + 2 $$
المطلوب: احسب النهاية التالية: 
$$ \\lim_{x \\to +\\infty} f(x) $$
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 20px 0; border-radius: 5px; font-size: 1.05em;">
<strong style="color: #16a085; font-size: 1.1em;">✅ الحل المفصل:</strong><br/><br/>
لحساب نهاية هذه الدالة عند $+\\infty$، نقوم بحساب نهاية كل حد على حدة:

<ol style="margin-right: 20px;">
  <li style="margin-bottom: 10px;">
    <strong>نهاية الحد الأول $\\dfrac{1}{x}$:</strong><br/>
    نعلم من النهايات المرجعية أن نهاية المقلوب عند اللانهاية هي الصفر:
    $$ \\lim_{x \\to +\\infty} \\frac{1}{x} = 0 $$
  </li>
  <li style="margin-bottom: 10px;">
    <strong>نهاية الحد الثاني (الثابت):</strong><br/>
    نهاية العدد الثابت تبقى نفسها:
    $$ \\lim_{x \\to +\\infty} 2 = 2 $$
  </li>
</ol>

<strong>ومنه بجمع النهايتين، نحصل على:</strong>
$$ \\lim_{x \\to +\\infty} f(x) = 0 + 2 = 2 $$

<div style="background: #fef9e7; padding: 10px; border-right: 4px solid #f39c12; margin-top: 15px;">
<strong style="color: #d35400;">التفسير الهندسي:</strong><br/>
بما أن $\\lim_{x \\to +\\infty} f(x) = 2$، إذن المستقيم ذو المعادلة $y = 2$ هو <strong>مستقيم مقارب أفقي</strong> لمنحنى الدالة $C_f$ بجوار $+\\infty$.
</div>
</div>

</div>
`;

            let oldContent = lesson.content;

            // Find the "مثال تطبيقي" section in the original content and replace it
            // Or if it's the whole content of a specific block...
            // Let's replace the old example block:

            // Using a regex to replace everything from "مثال تطبيقي" until the end of the section or similar
            // Wait, it is better to just replace the specific broken HTML manually inside JS.
            let pattern = /<h3[^>]*>\s*✏️\s*مثال تطبيقي\s*<\/h3>\s*<div[^>]*>[\s\S]*?(?=<\/div>|<\/div>\s*<\/div>|<\div)/;

            console.log("Original content matches example?", lesson.content.includes("مثال تطبيقي"));

            // I will just download the whole original content and manipulate it locally instead of raw replace
            // to avoid messing it up.
            require('fs').writeFileSync('tmp_lesson.html', lesson.content);
            console.log("Saved to tmp_lesson.html");
        }
    }
}

main();

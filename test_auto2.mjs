import { JSDOM } from 'jsdom';
import katexRender from 'katex/dist/contrib/auto-render.js';

const dom = new JSDOM(`<!DOCTYPE html><html><body>
<p>📝 معطيات المثال:
لتكن الدالة $ f $ المعرفة بـ: $ f(x) = \\frac{1}{x} + 2 $
المطلوب: احسب النهاية $ \\displaystyle\\lim_{x \\to +\\infty} f(x) $ ، ثم أعط تفسيراً هندسياً (بيانياً) للنتيجة.</p>
</body></html>`);
global.document = dom.window.document;
global.Node = dom.window.Node;
const body = dom.window.document.body;

katexRender(body, {
    delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\begin{equation}", right: "\\end{equation}", display: true },
        { left: "\\begin{align}", right: "\\end{align}", display: true }
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "option"],
    throwOnError: false,
});

console.log(body.innerHTML);

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = `
<h2>1. النهاية المنتهية عند نقطة <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>a</mi></mrow><annotation encoding="application/x-tex">a</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">a</span></span></span></span></h2>
<h2>4. رفع عدم التعيين من الشكل <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>0</mn><mn>0</mn></mfrac></mrow><annotation encoding="application/x-tex">\\frac{0}{0}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></h2>
`;

const dom = new JSDOM(html);
const document = dom.window.document;

function extractText(node) {
    const clone = node.cloneNode(true);

    clone.querySelectorAll('.katex').forEach(el => {
        const annotation = el.querySelector('annotation');
        if (annotation) {
            let tex = annotation.textContent || "";
            // Replace \dfrac and \frac with /
            tex = tex.replace(/\\d?frac{([^}]+)}{([^}]+)}/g, '$1/$2');
            tex = tex.replace(/\\infty/g, '∞');
            // Remove backslashes from remaining latex commands if any, or just leave text
            tex = tex.replace(/\$/g, '');
            // Just replace the katex element with a text node
            const textNode = document.createTextNode(` ${tex.trim()} `);
            el.parentNode.replaceChild(textNode, el);
        } else {
            // fallback
            const html = el.querySelector('.katex-html');
            if (html) html.remove();
            const ann = el.querySelector('annotation');
            if (ann) ann.remove();
        }
    });

    // Normalize spaces
    return (clone.textContent || "").replace(/\s+/g, ' ').trim();
}

document.querySelectorAll('h2').forEach(h2 => {
    console.log("Original textContent:", h2.textContent);
    console.log("Extracted text:", extractText(h2));
});

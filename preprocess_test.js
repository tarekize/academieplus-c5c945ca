function preprocessContent(raw) {
    let s = raw;
    s = s.replace(/\$(\s*)([^$\n]+?)(\s*)\$/g, (match, space1, math, space2) => {
        return '$' + math + '$';
    });
    s = s.replace(/([^\n])\$\$/g, "$1\n$$").replace(/\$\$([^\n])/g, "$$\n$1");
    s = s.replace(/(\S)\$(?!\$)/g, "$1 $");
    s = s.replace(/(?<!\$)\$(\S)/g, (m, c) => {
        if (c === "$") return m;
        return "$ " + c;
    });
    s = s.replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (match, prefix, mathContent) => {
        if (mathContent.includes('class="math')) return match;
        return prefix + '<span class="math math-inline">' + mathContent + '</span>';

        console.log(preprocessContent('إذن المستقيم $y = 2$ هو مقارب'));

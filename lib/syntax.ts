const KW_SET = new Set(['void','int','float','char','double','long','short','unsigned','return','if','else','while','for','do','break','continue','struct','typedef','sizeof','include','math','sqrt','NULL']);
const OP_SET = new Set(['++','--','->','==','!=','<=','>=','&&','||','+=','-=','*=','/=','<<','>>']);
const OP_CHARS = '+-*/%=<>!&|^~';

function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightCode(raw: string) {
    let r = '', i = 0, s = raw;
    while (i < s.length) {
        if (s[i] === ' ' || s[i] === '\t') { r += s[i]; i++; continue; }
        // Comments
        if (s[i] === '/' && s[i + 1] === '/') { r += '<span class="cmt">' + esc(s.slice(i)) + '</span>'; break; }
        // Strings
        if (s[i] === '"') {
            let j = i + 1;
            while (j < s.length && s[j] !== '"') j++;
            if (j < s.length) j++;
            r += '<span class="str">' + esc(s.slice(i, j)) + '</span>';
            i = j;
            continue;
        }
        // Numbers
        if (/\d/.test(s[i]) && (i === 0 || !/\w/.test(s[i - 1]))) {
            let j = i;
            while (j < s.length && /\d/.test(s[j])) j++;
            r += '<span class="num">' + s.slice(i, j) + '</span>';
            i = j;
            continue;
        }
        // Keywords and Identifiers
        if (/[a-zA-Z_]/.test(s[i])) {
            let j = i;
            while (j < s.length && /\w/.test(s[j])) j++;
            const w = s.slice(i, j);
            r += KW_SET.has(w) ? '<span class="kw">' + w + '</span>' : w;
            i = j;
            continue;
        }
        // Multi-char operators
        if (i + 1 < s.length && OP_SET.has(s.slice(i, i + 2))) {
            r += '<span class="op">' + esc(s.slice(i, i + 2)) + '</span>';
            i += 2;
            continue;
        }
        // Single-char operators
        if (OP_CHARS.includes(s[i])) {
            r += '<span class="op">' + esc(s[i]) + '</span>';
            i++;
            continue;
        }
        // Defaults
        r += esc(s[i]);
        i++;
    }
    return r;
}

const KW_SET_C = new Set(['void','int','float','char','double','long','short','unsigned','return','if','else','while','for','do','break','continue','struct','typedef','sizeof','include','math','sqrt','NULL']);
const KW_SET_PY = new Set(['def','in','range','elif','print','and','or','True','False','None','for','if','else','while','return','break','continue','import','len']);
const KW_SET_JS = new Set(['function','let','const','console','log','new','Array','fill','for','if','else','while','return','break','continue','true','false','null','push','pop','slice']);

const OP_SET = new Set(['++','--','->','==','!=','<=','>=','&&','||','+=','-=','*=','/=','<<','>>']);
const OP_CHARS = '+-*/%=<>!&|^~';

function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function getTranslatedCode(cCode: string, lang: 'c' | 'python' | 'javascript'): string {
    if (lang === 'c' || !cCode) return cCode;

    if (lang === 'javascript') {
        return cCode
            .replace(/#include[^\n]*/g, '')
            .replace(/#define\s+(\w+)\s+(\d+)/g, 'const $1 = $2;')
            .replace(/struct\s+(\w+)\s*\{([\s\S]*?)\};/g, (match, className, body) => {
                const fields = body.split('\n')
                    .map((l: string) => l.trim())
                    .filter((l: string) => l && !l.startsWith('//'))
                    .map((l: string) => {
                        const name = l.replace(/struct\s+\w+\*?/g, '').replace(/int\s+/g, '').replace(/bool\s+/g, '').replace(/[*;]/g, '').trim().split(/\s+/).pop();
                        return `        this.${name} = null;`;
                    })
                    .join('\n');
                return `class ${className} {\n    constructor() {\n${fields}\n    }\n}`;
            })
            .replace(/void\s+(\w+)\s*\((.*?)\)\s*\{/g, 'function $1($2) {')
            .replace(/int\s+(\w+)\s*\((.*?)\)\s*\{/g, 'function $1($2) {')
            .replace(/struct\s+\w+\*\s+(\w+)\s*\((.*?)\)\s*\{/g, 'function $1($2) {')
            .replace(/struct\s+\w+\*\s+(\w+)\s*=/g, 'let $1 =')
            .replace(/\(struct\s+\w+\*\)malloc\(sizeof\(struct\s+\w+\)\)/g, 'new Node()')
            .replace(/malloc\(sizeof\(struct\s+\w+\)\)/g, 'new Node()')
            .replace(/free\((\w+)\);?/g, '$1 = null;')
            .replace(/int\s+(\w+)\s*=/g, 'let $1 =')
            .replace(/bool\s+(\w+)\s*=/g, 'let $1 =')
            .replace(/int\s+(\w+)\s*\[(.*?)\]\s*;/g, 'let $1 = new Array($2).fill(0);')
            .replace(/bool\s+(\w+)\s*\[(.*?)\]\s*;/g, 'let $1 = new Array($2).fill(false);')
            .replace(/struct\s+\w+\*\s+slots\s*\[(.*?)\]\s*=\s*\{NULL\};/g, 'const slots = new Array($1).fill(null);')
            .replace(/char\*\s+(\w+)/g, '$1')
            .replace(/int\s+(\w+)/g, '$1')
            .replace(/->/g, '.')
            .replace(/printf\((.*?)\);/g, 'console.log($1);')
            .replace(/printf\((.*?)\\n(.*?)\)/g, 'console.log($1$2)')
            .replace(/NULL/g, 'null')
            .replace(/true/g, 'true')
            .replace(/false/g, 'false');
    }

    if (lang === 'python') {
        const lines = cCode.split(/\r?\n/);
        const pythonLines: string[] = [];
        let indentLevel = 0;
        let insideStruct: string | null = null;
        let structFields: string[] = [];

        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                pythonLines.push('');
                continue;
            }

            if (trimmed.startsWith('#include')) continue;
            if (trimmed.startsWith('#define')) {
                const match = trimmed.match(/#define\s+(\w+)\s+(\d+)/);
                if (match) {
                    pythonLines.push(`${match[1]} = ${match[2]}`);
                }
                continue;
            }

            if (trimmed === '{') {
                indentLevel++;
                continue;
            }
            if (trimmed === '}') {
                indentLevel = Math.max(0, indentLevel - 1);
                if (insideStruct) {
                    const pyClassLines = [
                        `class ${insideStruct}:`,
                        `    def __init__(self):`
                    ];
                    structFields.forEach(f => {
                        pyClassLines.push(`        self.${f} = None`);
                    });
                    pythonLines.push(...pyClassLines.map(l => '    '.repeat(indentLevel) + l));
                    insideStruct = null;
                    structFields = [];
                }
                continue;
            }
            if (trimmed.startsWith('} else if') || trimmed.startsWith('} else')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            if (trimmed.startsWith('struct ') && trimmed.endsWith('{')) {
                const sName = trimmed.replace('struct ', '').replace('{', '').trim();
                insideStruct = sName;
                structFields = [];
                indentLevel++;
                continue;
            } else if (trimmed.startsWith('struct ') && trimmed.endsWith('};')) {
                const sName = trimmed.replace('struct ', '').replace('};', '').trim().split(/\s+/)[0];
                insideStruct = sName;
                structFields = [];
                indentLevel++;
                indentLevel = Math.max(0, indentLevel - 1);
                const pyClassLines = [
                    `class ${insideStruct}:`,
                    `    def __init__(self):`,
                    `        pass`
                ];
                pythonLines.push(...pyClassLines.map(l => '    '.repeat(indentLevel) + l));
                insideStruct = null;
                continue;
            }

            if (insideStruct) {
                const fieldName = trimmed.replace(/struct\s+\w+\*?/g, '').replace(/int\s+/g, '').replace(/bool\s+/g, '').replace(/[*;]/g, '').trim().split(/\s+/).pop();
                if (fieldName) {
                    structFields.push(fieldName);
                }
                continue;
            }

            let translated = trimmed
                .replace(/void\s+(\w+)\s*\((.*?)\)\s*\{?/g, 'def $1($2):')
                .replace(/bool\s+(\w+)\s*\((.*?)\)\s*\{?/g, 'def $1($2):')
                .replace(/int\s+(\w+)\s*\((.*?)\)\s*\{?/g, 'def $1($2):')
                .replace(/struct\s+\w+\*\s+(\w+)\s*\((.*?)\)\s*\{?/g, 'def $1($2):')
                .replace(/int\s+strlen\((.*?)\)/g, 'len($1)')
                .replace(/strlen\((.*?)\)/g, 'len($1)')
                .replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(.*?);\s*\1\s*<\s*(.*?);\s*\1\s*\+\+\s*\)\s*\{?/g, 'for $1 in range($2, $3):')
                .replace(/for\s*\(\s*int\s+(\w+)\s*=\s*(.*?);\s*\1\s*<=\s*(.*?);\s*\1\s*\+\+\s*\)\s*\{?/g, 'for $1 in range($2, $3 + 1):')
                .replace(/for\s*\(\s*(\w+)\s*=\s*(.*?);\s*\1\s*<\s*(.*?);\s*\1\s*\+\+\s*\)\s*\{?/g, 'for $1 in range($2, $3):')
                .replace(/for\s*\(\s*(\w+)\s*=\s*(.*?);\s*\1\s*<=\s*(.*?);\s*\1\s*\+\+\s*\)\s*\{?/g, 'for $1 in range($2, $3 + 1):')
                .replace(/if\s*\((.*?)\)\s*\{?/g, 'if $1:')
                .replace(/else\s+if\s*\((.*?)\)\s*\{?/g, 'elif $1:')
                .replace(/else\s*\{?/g, 'else:')
                .replace(/while\s*\((.*?)\)\s*\{?/g, 'while $1:')
                .replace(/int\s+(\w+)\s*=\s*(.*?);/g, '$1 = $2')
                .replace(/bool\s+(\w+)\s*=\s*(.*?);/g, '$1 = $2')
                .replace(/int\s+(\w+)\s*\[(.*?)\]\s*;?/g, '$1 = [0] * ($2)')
                .replace(/bool\s+(\w+)\s*\[(.*?)\]\s*;?/g, '$1 = [False] * ($2)')
                .replace(/struct\s+\w+\*\s+slots\s*\[(.*?)\]\s*=\s*\{NULL\};/g, 'slots = [None] * $1')
                .replace(/struct\s+\w+\*\s+/g, '')
                .replace(/char\*\s+/g, '')
                .replace(/int\s+/g, '')
                .replace(/bool\s+/g, '')
                .replace(/float\s+/g, '')
                .replace(/\(struct\s+\w+\*\)malloc\(sizeof\(struct\s+\w+\)\)/g, 'Node()')
                .replace(/malloc\(sizeof\(struct\s+\w+\)\)/g, 'Node()')
                .replace(/free\((\w+)\)/g, 'del $1')
                .replace(/->/g, '.')
                .replace(/printf\("(.*?)",\s*(.*?)\);?/g, 'print(f"$1 = {$2}")')
                .replace(/printf\("(.*?)"\);?/g, 'print("$1")')
                .replace(/;/g, '')
                .replace(/&&/g, 'and')
                .replace(/\|\|/g, 'or')
                .replace(/true/g, 'True')
                .replace(/false/g, 'False')
                .replace(/NULL/g, 'None');

            if (translated.endsWith(' {')) {
                translated = translated.slice(0, -2);
            }
            if (translated.endsWith('}')) {
                translated = translated.replace(/\s*\}\s*$/, '');
            }

            if (translated) {
                pythonLines.push('    '.repeat(indentLevel) + translated);
            }

            if (trimmed.startsWith('} else if') || trimmed.startsWith('} else')) {
                indentLevel++;
            }
        }
        return pythonLines.join('\n');
    }

    return cCode;
}

export function highlightCode(raw: string, lang: 'c' | 'python' | 'javascript' = 'c') {
    let r = '', i = 0, s = raw;
    const kwSet = lang === 'python' ? KW_SET_PY : (lang === 'javascript' ? KW_SET_JS : KW_SET_C);
    
    while (i < s.length) {
        if (s[i] === ' ' || s[i] === '\t') { r += s[i]; i++; continue; }
        // Comments
        if ((s[i] === '/' && s[i + 1] === '/') || (lang === 'python' && s[i] === '#')) { 
            r += '<span class="cmt">' + esc(s.slice(i)) + '</span>'; 
            break; 
        }
        // Strings
        if (s[i] === '"' || s[i] === "'") {
            const quoteChar = s[i];
            let j = i + 1;
            while (j < s.length && s[j] !== quoteChar) j++;
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
            r += kwSet.has(w) ? '<span class="kw">' + w + '</span>' : w;
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

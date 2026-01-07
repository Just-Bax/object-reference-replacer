'use strict';

const App = (() => {
    let objectReferenceData = null;
    let editor = null;

    const CONSTANTS = {
        BUTTON_TEXT: 'Load CSV (OBJ REF)',
        DEFAULT_SQL: '-- Your PL/SQL code here',
        EDITOR_HEIGHT: 500,
        ALERT_MESSAGE: 'Please load a CSV file first',
        OBJECT_TYPES: {
            FIELDS: 'Fields',
            TRACKOR_TREE: 'Trackor Tree',
            TRACKOR_TYPES: 'Trackor Types',
            VALIDATION_TABLES: 'Validation Tables'
        }
    };

    const initializeEditor = () => {
        const editorElement = document.getElementById('editor');
        if (!editorElement) return;

        if (typeof CodeMirror !== 'undefined' && CodeMirror.commands) {
            CodeMirror.commands.pasteSql = () => {
                pasteSql();
            };
        }

        editor = CodeMirror(editorElement, {
            mode: 'text/x-plsql',
            lineNumbers: true,
            theme: 'default',
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
                'Ctrl-V': 'pasteSql'
            }
        });
        editor.setSize(null, CONSTANTS.EDITOR_HEIGHT);
        editor.setValue(CONSTANTS.DEFAULT_SQL);
    };

    const escapeHtml = (unsafe) => {
        return String(unsafe)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    };

    const updateFileLabel = (fileId, filename, options = {}) => {
        const fileLabel = document.querySelector(`label[for="${fileId}"]`);
        if (!fileLabel) return;

        const displayText = filename 
            ? `${CONSTANTS.BUTTON_TEXT} [${filename}]` 
            : CONSTANTS.BUTTON_TEXT;

        if (options.allowHtml) {
            fileLabel.innerHTML = options.html || escapeHtml(displayText);
            return;
        }

        fileLabel.textContent = displayText;
    };

    const parseCSV = (csvContent) => {
        const rows = csvContent.trim().split('\n');
        if (rows.length < 2) return [];

        const headers = rows[1].split(',').map(header => header.trim());
        const result = [];

        for (let i = 2; i < rows.length; i++) {
            if (!rows[i].trim()) continue;

            const columns = rows[i].split(',').map(col => col.trim());
            const rowObject = {};

            headers.forEach((header, index) => {
                rowObject[header] = columns[index] || '';
            });

            result.push(rowObject);
        }

        return result;
    };

    const applyPrefixToReference = (referenceName, objectType, prefix) => {
        const prefixPatterns = {
            [CONSTANTS.OBJECT_TYPES.FIELDS]: [
                { pattern: 'id.', replacement: `id.${prefix}_` },
                { pattern: '.cf.', replacement: `.cf.${prefix}_` }
            ],
            [CONSTANTS.OBJECT_TYPES.TRACKOR_TREE]: [
                { pattern: 'id.', replacement: `id.${prefix}_` },
                { pattern: '.rel.', replacement: `.rel.${prefix}_` }
            ],
            [CONSTANTS.OBJECT_TYPES.TRACKOR_TYPES]: [
                { pattern: 'id.', replacement: `id.${prefix}_` }
            ],
            [CONSTANTS.OBJECT_TYPES.VALIDATION_TABLES]: [
                { pattern: '.vt.', replacement: `.vt.${prefix}_` }
            ]
        };

        const patterns = prefixPatterns[objectType];
        if (!patterns) return referenceName;

        let result = referenceName;
        patterns.forEach(({ pattern, replacement }) => {
            result = result.replace(pattern, replacement);
        });

        return result;
    };

    const readFile = (input) => {
        const file = input.files?.[0];
        if (!file) return;

        updateFileLabel(input.id, file.name, {
            allowHtml: true,
            html: `<i data-lucide="file-up" class="icon"></i>${escapeHtml(CONSTANTS.BUTTON_TEXT)} <span class="muted">[${escapeHtml(file.name)}]</span>`
        });

        if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            objectReferenceData = parseCSV(event.target.result);
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
    };

    const replaceSql = () => {
        if (!objectReferenceData) {
            alert(CONSTANTS.ALERT_MESSAGE);
            return;
        }

        if (!editor) return;

        let sql = editor.getValue();
        const matches = sql.match(/\b\d+\b/g);
        if (!matches) return;

        const idGet = document.getElementById('id-get')?.checked ?? true;
        const prefix = document.getElementById('prefix')?.value.toLowerCase().trim() || '';
        const objectReferenceIds = new Set(matches);

        objectReferenceData.forEach((objRef) => {
            const objectReferenceId = objRef.OBJ_ID;
            const objectType = objRef.OBJ_TYPE;
            let objectReferenceName = objRef.OBJ_REF;

            if (!objectReferenceIds.has(objectReferenceId)) return;

            const regex = new RegExp(`\\b${objectReferenceId}\\b`, 'g');

            if (prefix) {
                objectReferenceName = applyPrefixToReference(objectReferenceName, objectType, prefix);
            }

            const replacement = idGet 
                ? `id.get('${objectReferenceName}')` 
                : objectReferenceName;

            sql = sql.replace(regex, replacement);
        });

        editor.setValue(sql);
    };

    const removeIdGet = () => {
        if (!editor) return;

        let sql = editor.getValue();
        const regex = /id\.get\('([^']+)'\)/g;
        sql = sql.replace(regex, '$1');
        editor.setValue(sql);
    };

    const copySql = async () => {
        if (!editor) return;

        const sql = editor.getValue();
        try {
            await navigator.clipboard.writeText(sql);
        } catch (error) {
            const textarea = document.createElement('textarea');
            textarea.value = sql;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    };

    const pasteSql = async () => {
        if (!editor) return;

        try {
            const text = await navigator.clipboard.readText();
            if (typeof text === 'string') {
                editor.setValue(text);
            }
        } catch (error) {
            alert('Clipboard access is not available. Paste with Ctrl+V into the editor.');
        }
    };

    const init = () => {
        document.addEventListener('DOMContentLoaded', initializeEditor);
    };

    return {
        init,
        readFile,
        replaceSql,
        removeIdGet,
        copySql,
        pasteSql,
        updateFileLabel
    };
})();

App.init();

function read_file(input) {
    App.readFile(input);
}

function replace_sql() {
    App.replaceSql();
}

function remove_obj_ref() {
    App.removeIdGet();
}

function copy_sql() {
    App.copySql();
}

function paste_sql() {
    App.pasteSql();
}

function update_file_label(fileId, filename, options) {
    App.updateFileLabel(fileId, filename, options);
}

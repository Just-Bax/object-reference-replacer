'use strict';

const App = (() => {
    let objectReferenceData = null;
    let editor = null;

    const CONSTANTS = {
        BUTTON_TEXT: 'Load CSV',
        DEFAULT_SQL: '-- Your PL/SQL code here',
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
        editor.setSize(null, '100%');
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

    const updateFileLabel = (fileId, filename) => {
        const fileStatus = document.getElementById('file-status');
        const toolPanel = document.getElementById('tool-panel');
        const hasFile = Boolean(filename);

        if (fileStatus) {
            fileStatus.textContent = hasFile ? filename : 'CSV required';
            fileStatus.classList.toggle('loaded', hasFile);
        }

        if (toolPanel) {
            toolPanel.classList.toggle('csv-loaded', hasFile);
        }
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

    const loadObjectReferenceFile = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            objectReferenceData = parseCSV(event.target.result);
            updateFileLabel('obj-ref', file.name);
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
    };

    const readFile = (input) => {
        const file = input.files?.[0];
        if (!file) return;

        loadObjectReferenceFile(file);
        input.value = '';
    };

    const initializeUploadDropZone = () => {
        const dropZone = document.getElementById('upload-drop-zone');
        if (!dropZone) return;

        const stopDefaults = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };

        ['dragenter', 'dragover'].forEach((eventName) => {
            dropZone.addEventListener(eventName, (event) => {
                stopDefaults(event);
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach((eventName) => {
            dropZone.addEventListener(eventName, (event) => {
                stopDefaults(event);
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (event) => {
            const file = event.dataTransfer?.files?.[0];
            if (file) {
                loadObjectReferenceFile(file);
            }
        });
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
        document.addEventListener('DOMContentLoaded', () => {
            initializeEditor();
            initializeUploadDropZone();
        });
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

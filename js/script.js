var object_reference_data = null;
var editor = null;

document.addEventListener('DOMContentLoaded', function () {
    editor = CodeMirror(document.getElementById('editor'), {
        mode: 'text/x-plsql',
        lineNumbers: true,
        theme: 'default',
        extraKeys: {
            'Ctrl-Space': 'autocomplete'
        }
    });
    editor.setValue("-- Your PL/SQL code here");
});

function update_label(file_id, filename) {
    const button_text = "Object Reference file";
    const file_input = document.getElementById(file_id);
    const file_label = document.querySelector(`label[for="${file_id}"]`);
    file_label.textContent = button_text + ' ' + (file_input.files.length > 0 ? `[${filename}]` : '');
}

function parse_csv(csv_content) {
    var rows = csv_content.split('\n');
    var headers = rows[1].split(',');
    var result = [];
    for (var i = 2; i < rows.length; i++) {
        var columns = rows[i].split(',');
        var row_object = {};
        for (var j = 0; j < headers.length; j++) {
            row_object[headers[j]] = columns[j];
        }
        result.push(row_object);
    }
    return result;
}

function read_file(input) {
    var file = input.files[0];
    update_label(input.id, file.name);
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (event) {
        object_reference_data = parse_csv(event.target.result);
    };
}

function replace_sql(sql) {
    if (object_reference_data === null) {
        alert('Object Reference file is not selected');
        return;
    }
    var sql = editor.getValue();
    var matches = sql.match(/\b\d+\b/g);
    if ( matches ) {
        const id_get = document.getElementById('id-get').checked;
        const object_reference_ids = new Set(matches);
        for (const objRef of object_reference_data) {
            const object_reference_id = objRef['OBJ_ID'];
            const object_reference_name = objRef['OBJ_REF'];
            if (object_reference_ids.has(object_reference_id)) {
                const regex = new RegExp(`\\b${object_reference_id}\\b`, 'g');
                sql = sql.replace(regex, id_get ? `id.get('${object_reference_name}')` : object_reference_name);
            }
        }
    }
    editor.setValue(sql);
}

function copy_sql() {
    var sql = editor.getValue();
    navigator.clipboard.writeText(sql);
}
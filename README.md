# Object Reference Replacer

A web-based tool for replacing object reference IDs in PL/SQL code with their corresponding reference names from a CSV file.

## Features

- **SQL Editor**: Built-in CodeMirror editor with PL/SQL syntax highlighting
- **CSV Import**: Load object reference mappings from CSV files
- **Automatic Replacement**: Replace numeric IDs with object reference names
- **Module Prefix**: Add custom prefixes to object references
- **ID Get Wrapper**: Optionally wrap references in `id.get()` function
- **Copy to Clipboard**: Quick copy functionality for processed SQL

## Usage

1. **Open the Application**: Open `index.html` in a web browser
2. **Load CSV File**: Click "Object Reference csv file" and select your CSV file
3. **Paste SQL Code**: Enter or paste your PL/SQL code in the editor
4. **Configure Options**:
   - Add a module prefix if needed
   - Toggle "Id Get" checkbox to wrap references in `id.get()`
5. **Replace**: Click "Replace" to process the SQL
6. **Copy**: Use "Copy" button to copy the result to clipboard

## CSV Format

The CSV file should have the following structure:

```
Header Row (ignored)
OBJ_ID,OBJ_TYPE,OBJ_REF
123,Fields,id.trackor_type.cf.field_name
456,Trackor Types,id.trackor_type.tt
789,Validation Tables,id.vt.table_name
```

### Supported Object Types

All object references start with `id.` and follow these patterns:

- **Fields**: Custom field references in format `id.trackor_type.cf.field_name`
- **Relation**: Relationship references in format `id.trackor_type.rel.relationship_name`
- **Trackor Types**: Trackor type references in format `id.trackor_type.tt`
- **Validation Tables**: Validation table references in format `id.vt.table_name`

## Module Prefix

When a module prefix is specified, it will be added to object references based on their type:

- **Fields**: `id.trackor_type.cf.field_name` → `id.prefix_trackor_type.cf.prefix_field_name`
- **Relation**: `id.trackor_type.rel.relationship_name` → `id.prefix_trackor_type.rel.prefix_relationship_name`
- **Trackor Types**: `id.trackor_type.tt` → `id.prefix_trackor_type.tt`
- **Validation Tables**: `id.vt.table_name` → `id.vt.prefix_table_name`

## Remove ID Get

The "Remove ID Get" button strips `id.get()` wrappers from all references in the SQL code, converting:
- `id.get('reference')` → `reference`

## Project Structure

```
object-reference-replacer/
├── index.html          # Main HTML file
├── assets/
│   ├── styles.css      # Application styles
│   └── script.js       # Application logic
└── README.md           # Documentation
```

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- CodeMirror 6.65.7

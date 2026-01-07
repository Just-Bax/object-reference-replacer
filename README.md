# Object Reference Replacer

A lightweight, browser-based utility that replaces numeric object IDs in PL/SQL code with their corresponding reference names using a CSV mapping export.

## Features

### Load CSV File with OBJ REF

- Load a CSV export containing `OBJ_ID`, `OBJ_TYPE`, and `OBJ_REF`.
- The UI shows the loaded filename so you can confirm which mapping is active.

### Replace IDs

- Replace numeric IDs in the editor using the loaded `OBJ_REF` mapping.
- Optional module prefix support (applies per object type).
- Optionally wrap replacements with `id.get()`.
- Remove existing `id.get()` wrappers from the SQL.

### Copy & Paste (Clipboard)

- Paste SQL directly from your clipboard into the editor.
- Copy the processed SQL back to your clipboard.

## Usage

1. **Open the Application**: Open `index.html` in a web browser
2. **Load CSV File**: Click **Load CSV (OBJ REF)** and select your CSV file
3. **Paste SQL Code**: Paste your PL/SQL code in the editor (or use the **Paste** button)
4. **Configure Options**:
   - Add a module prefix if needed
   - Toggle **Wrap with `id.get()`** if needed
5. **Replace**: Click "Replace" to process the SQL
6. **Copy**: Use the **Copy** button to copy the result to clipboard

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

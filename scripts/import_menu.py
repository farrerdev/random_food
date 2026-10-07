"""Read the source workbook; preserve its labels and per-dish provenance."""
import hashlib
import json
import sys
from pathlib import Path
import openpyxl

source = Path(sys.argv[1])
workbook = openpyxl.load_workbook(source, read_only=True, data_only=True)
dishes = []
for sheet in workbook:
    rows = list(sheet.values)
    if rows[0][0] == 'STT':
        columns = [(1, sheet.title, 3 if sheet.title == 'Món Canh' else 2)]
    else:
        columns = [(i, rows[0][i], i + 1) for i in (0, 3, 6) if i < len(rows[0]) and rows[0][i]]
    for row_number, row in enumerate(rows[1:], 2):
        for name_col, category, method_col in columns:
            if name_col >= len(row) or not row[name_col]:
                continue
            name = str(row[name_col]).strip()
            dishes.append({
                'id': hashlib.sha256(f'{category}|{name}'.encode()).hexdigest()[:12],
                'name': name, 'category': category,
                'method': str(row[method_col] or '').strip(),
                'source': {'sheet': sheet.title, 'row': row_number},
            })
assert len({d['id'] for d in dishes}) == len(dishes), 'Duplicate dishes need review'
output = Path(__file__).resolve().parents[1] / 'data/menu.json'
output.write_text(json.dumps({'source': source.name, 'dishes': dishes}, ensure_ascii=False, indent=2) + '\n')
print(f'Imported {len(dishes)} dishes from {len(workbook.sheetnames)} sheets')
print({c: sum(d['category'] == c for d in dishes) for c in dict.fromkeys(d['category'] for d in dishes)})

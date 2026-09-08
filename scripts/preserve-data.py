"""Extract the actual specialist fields and representative source records.

Dataset mid-ranks support nonclinical plotting only. These are not original
model results, probabilities, clinical cutoffs, or a clinical scoring formula.
"""
import ast
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / "historical/backend"
tree = ast.parse((source / "specialists.py").read_text(encoding="utf-8"))
constants = {}
for node in tree.body:
    if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name):
        name = node.targets[0].id
        if name.endswith("_FIELDS") and isinstance(node.value, ast.List):
            constants[name] = ast.literal_eval(node.value)
contracts = [
    {"id": ident, "name": label, "fields": constants[constant], "color": color}
    for ident, label, constant, color in [
        ("renal", "Renal", "RENAL_FIELDS", "#16766c"),
        ("retinal", "Retinal", "RETINAL_FIELDS", "#9a6720"),
        ("neuropathy", "Neuropathy", "NEUROPATHY_FIELDS", "#426aab"),
        ("cardiovascular", "Cardiovascular", "CARDIO_FIELDS", "#ba493b"),
    ]
]
with (source / "real_patients.csv").open() as f:
    rows = [{k: v if k in ("patient_id", "sex") else float(v) for k, v in row.items()} for row in csv.DictReader(f)]
fields = sorted({f for c in contracts for f in c["fields"]})
cohort = {f: sorted(r[f] for r in rows) for f in fields}
samples = [next(r for r in rows if r["patient_id"] == pid) for pid in ["P93758", "P93759", "P93812"]]
data = {"contracts": contracts, "samples": samples, "cohort": cohort, "cohortSize": len(rows)}
(root / "src/demo/source-data.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
print(f"Extracted {len(contracts)} contracts and {len(samples)} unchanged samples from {len(rows)} source rows.")

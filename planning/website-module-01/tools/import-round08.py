#!/usr/bin/env python3
"""Safely stage verified Spryxel Round05 design references in a NON-main Git checkout.

DEFAULT READ-ONLY. Requires Python 3.10+; no extra dependencies/network.
This never commits, pushes, merges, or approves visual master files.
"""
import argparse
import hashlib
import json
import pathlib
import subprocess
import sys
import zipfile

p = argparse.ArgumentParser()
p.add_argument("--repo", required=True, help="Existing local repository checkout")
p.add_argument("--archive", required=True, help="spryxel-round08-design-import-ready.zip")
p.add_argument("--apply", action="store_true", help="Copy only after all checks; no overwrite")
a = p.parse_args()

root = pathlib.Path(a.repo).resolve(strict=True)
if not (root / ".git").exists():
    sys.exit("STOP: --repo must be local Git repository root")
try:
    branch = subprocess.check_output(
        ["git", "-C", str(root), "branch", "--show-current"], text=True
    ).strip()
except Exception as exc:
    sys.exit(f"STOP: git branch read failed: {exc}")
if not branch or branch in {"main", "master"}:
    sys.exit("STOP: switch to a dedicated NON-main branch")
with zipfile.ZipFile(a.archive) as archive:
    info = json.loads(archive.read("IMPORT-MANIFEST.json"))
    if info.get("schemaVersion") != "SPRYXEL_WEB_R08_IMPORT_READY_1":
        sys.exit("STOP: manifest version mismatch")
    checked = []
    for item in info["files"]:
        rel = pathlib.PurePosixPath(item["repoPath"])
        if rel.is_absolute() or ".." in rel.parts or not str(rel).startswith("design/"):
            sys.exit(f"STOP: unexpected repo target: {rel}")
        source = "repo-files/" + rel.as_posix()
        zinfo = archive.getinfo(source)
        if zinfo.file_size > 25_000_000:
            sys.exit(f"STOP: oversized file: {rel}")
        data = archive.read(source)
        if (hashlib.sha256(data).hexdigest() != item["sha256"] or
                len(data) != item["sizeBytes"]):
            sys.exit(f"STOP: SHA256/size mismatch: {rel}")
        if rel.suffix == ".png" and not data.startswith(b"\x89PNG\r\n\x1a\n"):
            sys.exit(f"STOP: invalid PNG signature: {rel}")
        if rel.suffix == ".jpeg" and not data.startswith(b"\xff\xd8"):
            sys.exit(f"STOP: invalid JPEG signature: {rel}")
        dest = root.joinpath(*rel.parts)
        if dest.exists() or dest.is_symlink():
            sys.exit(f"STOP: refusal to overwrite: {rel}")
        parent = dest.parent
        while parent != root:
            if parent.is_symlink():
                sys.exit(f"STOP: symlinked parent: {rel}")
            parent = parent.parent
        checked.append((dest, data))
    if len(checked) != 8:
        sys.exit("STOP: expected exactly eight reference files")
    print(f"PASS: {len(checked)} verified source files, branch={branch}, apply={a.apply}")
    if a.apply:
        for dest, data in checked:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with dest.open("xb") as handle:
                handle.write(data)
        print("Copied. Review git diff and commit only through a scoped asset PR.")

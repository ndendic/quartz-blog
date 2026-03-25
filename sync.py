"""
Sync published notes from Ideaverse vault to Quartz content folder.

Scans the entire vault for notes with `publish: true` in frontmatter,
copies them to content/ with flattened paths, and resolves image embeds.

Usage:
    python sync.py                    # Sync from default vault
    python sync.py /path/to/vault     # Sync from specific vault
    python sync.py --dry-run          # Preview without copying
"""
import re
import sys
import shutil
import hashlib
from pathlib import Path

# Defaults
VAULT_DIR = Path("/home/ndendic/Projects/Ideaverse")
CONTENT_DIR = Path(__file__).parent / "content"
ASSETS_DIR = CONTENT_DIR / "assets"

# Files managed by hand (never overwritten by sync)
MANUAL_FILES = {"index.md", "Interactive Demo.md"}

# Image extensions to copy
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"}


def extract_frontmatter(text: str) -> dict:
    """Extract YAML frontmatter as a simple key-value dict."""
    if not text.startswith("---"):
        return {}
    end = text.find("---", 3)
    if end == -1:
        return {}
    fm = {}
    for line in text[3:end].strip().split("\n"):
        if ":" in line:
            key, _, value = line.partition(":")
            fm[key.strip()] = value.strip().strip('"').strip("'")
    return fm


def should_publish(path: Path) -> bool:
    """Check if a note has publish: true in frontmatter."""
    try:
        text = path.read_text(encoding="utf-8")
        fm = extract_frontmatter(text)
        return fm.get("publish", "").lower() == "true"
    except Exception:
        return False


def find_published_notes(vault: Path) -> list[Path]:
    """Find all markdown files with publish: true."""
    published = []
    for md in vault.rglob("*.md"):
        # Skip quartz-blog content folder itself (avoid circular copy)
        if "quartz-blog/content" in str(md):
            continue
        # Skip templates, .obsidian, etc.
        rel = md.relative_to(vault)
        if any(part.startswith(".") or part == "x" for part in rel.parts):
            continue
        if should_publish(md):
            published.append(md)
    return published


def find_embedded_images(text: str, note_dir: Path, vault: Path) -> list[tuple[str, Path]]:
    """Find Obsidian image embeds and resolve their paths."""
    images = []
    # Match ![[image.png]] and ![alt](image.png)
    patterns = [
        r'!\[\[([^\]]+\.(?:' + '|'.join(e.strip('.') for e in IMAGE_EXTS) + r'))\]\]',
        r'!\[[^\]]*\]\(([^)]+\.(?:' + '|'.join(e.strip('.') for e in IMAGE_EXTS) + r'))\)',
    ]
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            img_ref = match.group(1)
            # Try relative to note
            img_path = note_dir / img_ref
            if img_path.exists():
                images.append((img_ref, img_path))
                continue
            # Try vault-wide search
            for found in vault.rglob(Path(img_ref).name):
                if found.suffix.lower() in IMAGE_EXTS:
                    images.append((img_ref, found))
                    break
    return images


def sync(vault: Path, dry_run: bool = False):
    """Sync published notes to content folder."""
    print(f"Vault:   {vault}")
    print(f"Content: {CONTENT_DIR}")
    print()

    published = find_published_notes(vault)
    print(f"Found {len(published)} published notes:")
    for p in sorted(published):
        print(f"  {p.relative_to(vault)}")
    print()

    if dry_run:
        print("DRY RUN — no files copied.")
        return

    # Clean old synced files (keep manual files)
    for existing in CONTENT_DIR.glob("*.md"):
        if existing.name not in MANUAL_FILES:
            existing.unlink()
            print(f"  Removed old: {existing.name}")

    # Ensure assets dir exists
    ASSETS_DIR.mkdir(exist_ok=True)

    # Copy published notes
    copied = 0
    images_copied = 0
    for note_path in published:
        dest_name = note_path.stem + ".md"
        # Skip if it's a manual file
        if dest_name in MANUAL_FILES:
            print(f"  Skipped (manual): {dest_name}")
            continue

        text = note_path.read_text(encoding="utf-8")

        # Find and copy embedded images
        images = find_embedded_images(text, note_path.parent, vault)
        for img_ref, img_path in images:
            dest_img = ASSETS_DIR / img_path.name
            if not dest_img.exists() or img_path.stat().st_mtime > dest_img.stat().st_mtime:
                shutil.copy2(img_path, dest_img)
                images_copied += 1
            # Rewrite image path in content
            text = text.replace(f"![[{img_ref}]]", f"![{img_path.stem}](assets/{img_path.name})")

        dest = CONTENT_DIR / dest_name
        dest.write_text(text, encoding="utf-8")
        copied += 1
        print(f"  Synced: {note_path.relative_to(vault)} → {dest_name}")

    print(f"\nDone: {copied} notes synced, {images_copied} images copied.")


if __name__ == "__main__":
    vault = VAULT_DIR
    dry_run = False

    for arg in sys.argv[1:]:
        if arg == "--dry-run":
            dry_run = True
        elif Path(arg).is_dir():
            vault = Path(arg)

    sync(vault, dry_run)

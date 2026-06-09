import zipfile
import os
import re
import shutil

def clean_extract(zip_path, target_dir):
    """
    Extracts files from a zip and renames them to be safe for the filesystem.
    This avoids "Input/output error" and "File name too long" errors in WSL.
    """
    if os.path.exists(target_dir):
        print(f"Cleaning existing directory: {target_dir}")
        shutil.rmtree(target_dir, ignore_errors=True)
    
    os.makedirs(target_dir, exist_ok=True)
    
    print(f"Opening {zip_path}...")
    with zipfile.ZipFile(zip_path, 'r') as z:
        members = z.namelist()
        total = len(members)
        print(f"Found {total} files. Starting extraction...")
        
        for i, member in enumerate(members):
            if member.endswith('/'):
                continue
                
            # Get category (Fight/NonFight) and original filename
            parts = member.split('/')
            if len(parts) < 3: continue # Skip root files
            
            # parts expected: ['RWF-2000', 'train/val', 'Fight/NonFight', 'filename']
            # We want to keep the structure: train/Fight, train/NonFight, val/Fight, val/NonFight
            subpath = parts[1:-1] # e.g. ['train', 'Fight']
            filename = parts[-1]
            
            # Create a safe filename (short, ASCII)
            # Use index to ensure uniqueness if name cleaning causes collisions
            ext = os.path.splitext(filename)[1]
            safe_filename = f"video_{i}{ext}"
            
            # Target path
            dest_dir = os.path.join(target_dir, *subpath)
            os.makedirs(dest_dir, exist_ok=True)
            dest_path = os.path.join(dest_dir, safe_filename)
            
            # Extract
            try:
                with z.open(member) as source, open(dest_path, "wb") as target:
                    target.write(source.read())
            except Exception as e:
                print(f"Skipping {member}: {e}")
            
            if i % 100 == 0:
                print(f"Progress: {i}/{total}")

    print(f"Extraction complete. Data saved in: {target_dir}")

if __name__ == "__main__":
    zip_file = 'datasets/RWD-2000.zip'
    target = 'datasets/RWF-2000_ready'
    clean_extract(zip_file, target)

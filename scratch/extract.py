import zipfile
import os

zip_path = "backend-panzer-two.zip"
target_dir = "temp_src"

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    for file_info in zip_ref.infolist():
        if "src/app/(frontend)/blog-details/[slug]" in file_info.filename or \
           "src/app/(frontend)/brand-detail/[slug]" in file_info.filename or \
           "src/app/(frontend)/solution-details/[slug]" in file_info.filename:
            zip_ref.extract(file_info, target_dir)
            print(f"Extracted {file_info.filename}")

print("Done")

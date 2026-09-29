import imdlib as imd
import os
import time

START_YEAR = 1990
END_YEAR = 2023
BASE_DIR = r'C:\MOdel\data'

datasets = {
    'rain': os.path.join(BASE_DIR, 'imd_rain'),
    'tmax': os.path.join(BASE_DIR, 'imd_tmax'),
    'tmin': os.path.join(BASE_DIR, 'imd_tmin'),
}

for var_name, save_dir in datasets.items():
    os.makedirs(save_dir, exist_ok=True)
    print(f"\n{'='*60}")
    print(f"  DOWNLOADING: {var_name.upper()} ({START_YEAR}-{END_YEAR})")
    print(f"{'='*60}\n")
    
    for year in range(START_YEAR, END_YEAR + 1):
        expected_file = os.path.join(save_dir, f"{var_name}_{year}.grd")
        
        # In imdlib, maxtemp is saved as maxtemp_1990.grd, mintemp as mintemp_1990.grd
        if var_name == 'tmax':
            expected_file = os.path.join(save_dir, f"maxtemp_{year}.grd")
        elif var_name == 'tmin':
            expected_file = os.path.join(save_dir, f"mintemp_{year}.grd")
            
        if os.path.exists(expected_file) and os.path.getsize(expected_file) > 1024:
            print(f"Skipping {year} - already downloaded.")
            continue
            
        success = False
        retries = 15 # Retry heavily
        for attempt in range(retries):
            try:
                print(f"Downloading {var_name} for {year} (Attempt {attempt+1}/{retries})...")
                imd.get_data(var_name, year, year, fn_format='yearwise', file_dir=save_dir)
                success = True
                break
            except Exception as e:
                print(f"Failed {year}: server timeout. Retrying in 3 seconds...")
                time.sleep(3)
        
        if not success:
            print(f"!!! CRITICAL FAILURE: Could not download {year} !!!")

print("\nVerifying files...")
for var_name, save_dir in datasets.items():
    if os.path.exists(save_dir):
        files = [f for f in os.listdir(save_dir) if f.endswith('.grd')]
        total_size = sum(os.path.getsize(os.path.join(save_dir, f)) for f in files) / (1024*1024)
        print(f"  {var_name}: {len(files)} files, {total_size:.0f} MB")
    else:
        print(f"  {var_name}: Directory not found!")

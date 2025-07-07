import requests
import os

# List of image URLs
camera_locations = [
    "AlabamaHills1",
    "AlabamaHills2",
    "AllenPeak",
    "Almaden1",
    "AntelopeEagleLake1",
    "Almaden2",
    "BlackMtSCC",
    "BlackMtSCC2",
    "BonnyDoon",
    "Brookdale",
    "CarolDrive1",
    "CarolDrive2",
    "CastaneaRidge",
    "Chabot",
    "ChalkMtnLookout",
    "CSMCenter10",
    "CSMScience36",
    "CSMCanada9",
    "CupertinoHills",
    "DreamInn1", 
    "EagleRockLookout1",
    "EagleRockLookout2",
    "FairviewAlameda1",
    "FairviewAlameda2",
    "FoothillsPark",
    "GarinRidge1",
    "HighlandPeak",
    "HighlandPeak2",
    "JasperRidge",
    "LaneHill",
    "LimekilnCanyon",
    "LomaPrieta",
    "Mission1",
    "Mission2",
    "MontebelloPreserve",
    "MtAllison",
    "MtBielawski",
    "MtChaul",
    "MtHamiltonSCC1",
    "MtHamiltonSCC2",
    "MtHamiltonSCC3",
    "MtMadonna",
    "MtRodoni1",
    "MtRodoni2",
    "OaklandClorox",
    "OaklandColiseum",
    "PressonHill1",
    "PressonHill2",
    "RedwoodCity1",
    "RedwoodCity2",
    "SanJoseFoothills",
    "Weston1",
    "SilverMountain1",
    "SRVFDStation31",
    "StanfordDish",
    "SunolRidge1",
    "SunolRidge2",
    "Tunitas",
    "Watsonville1",
    "Watsonville2",
    "WiedemannHill"
]

# Directory to save the images
save_dir = "camera-feeds/no-fire"
os.makedirs(save_dir, exist_ok=True)

base_url = "https://cameras.alertcalifornia.org/public-camera-data/Axis-"

# request:
# latest thumbnail (low resolution small image)
# url_end = "/latest-thumb.jpg"
# or
# latest frame (high resolution large image)
# url_end = "/latest-frame.jpg"

url_end = "/latest-frame.jpg"

# Download each image
for i, camera_location in enumerate(camera_locations):
    url = base_url + camera_location + url_end
    response = requests.get(url)
    if response.status_code == 200:
        # Extract the base file name and add a unique identifier
        base_file_name = url.split('/')[-1]
        # unique_file_name = f"{camera_location}-{base_file_name}"
        unique_file_name = f"{camera_location}.jpg"
        file_name = os.path.join(save_dir, unique_file_name)
        with open(file_name, 'wb') as file:
            file.write(response.content)
        print(f"Downloaded {file_name}")
    else:
        print(f"Failed to download {url}")
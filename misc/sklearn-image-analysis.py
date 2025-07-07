import numpy as np
import pandas as pd
# import matplotlib.pyplot as plt
import os
import cv2

# Machine Learning models/algorithms
from sklearn.ensemble import RandomForestClassifier

# Model evaluation libraries
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder

import warnings
warnings.filterwarnings("ignore")

def preprocess_image_approach_two(dataset_path: str, size=(64, 64)):
    """Returns a 1-dimensional numpy array that represents a cropped grayscale image\n
    Given a file path, this function preserves the color of the image,\n
    crops it to ........ pixels, and finally converts it into a 1-dimensional array
    """
    # use opencv to convert image file into 3d numpy array
    img = cv2.imread(dataset_path)

    center_y = img.shape[0] // 2
    center_x = img.shape[1] // 2
    crop_size = 500
    start_y = center_y - crop_size
    start_x = center_x - crop_size
    end_y = center_y + crop_size
    end_x = center_x + crop_size
    img = img[start_y:end_y, start_x:end_x]
    
    size=(64, 64)
    img_resized = cv2.resize(img, size)  # Resize to reduce features
    # flatten 2d array into 1d
    return img_resized.ravel()

def preprocess_image(file_path: str):
    """Returns a 1 or 2 dimensional numpy array of an image given its file path\n
    crops image\n
    flattens image into 1 or 2d numpy array
    """
    # use opencv to convert image file into numpy array
    img = cv2.imread(file_path)

    center_y = img.shape[0] // 2
    center_x = img.shape[1] // 2
    crop_size = 1000
    start_y = center_y - crop_size
    start_x = center_x - crop_size
    end_y = center_y + crop_size
    end_x = center_x + crop_size
    img = img[start_y:end_y, start_x:end_x]

    # flatten 2d array into 1d
    return img.ravel()

X = [] # features
y = [] # labels
data_input_size = 100 # train on maximum 100 images

# preprocess images from the camera feeds
# then add the preprocessed images to the dataset while labelling them
for category in ['fire', 'no-fire']:
    for file_name in os.listdir(f"camera-feed-images/{category}/")[:data_input_size]:
        X.append( preprocess_image(f"camera-feed-images/{category}/{file_name}") )
        y.append(category) # label corresponding data

# convert to numpy arrays, encode labels, and split into test and training data
X = np.array(X)
y = LabelEncoder().fit_transform(np.array(y))
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# fit model on images and test
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)
y_pred = rf_model.predict(X_test)

print(f"RandomForest n_estimators=100")
print(f"{data_input_size} images trained")
print(f"Accuracy: {accuracy_score(y_test, y_pred)}")
print(classification_report(y_test, y_pred))
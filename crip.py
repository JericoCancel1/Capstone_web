import requests
import numpy as np
from PIL import Image

# Load and preprocess the image
def preprocess_image(image_path):
    img = Image.open(image_path)  # Open image using Pillow
    img = img.resize((150, 150))  # Resize to (150, 150) as required by your model
    img_array = np.array(img)  # Convert image to numpy array
    if img_array.shape[-1] == 4:  # If the image has an alpha channel (RGBA), remove it
        img_array = img_array[:, :, :3]
    img_array = img_array.astype('float32') / 255.0  # Normalize pixel values to [0, 1]
    return img_array

# Prepare the image
image_path = 'mesita.jpg'  # Replace with the actual path to your image
input_image = preprocess_image(image_path)

# Reshape the image array for your model (1, 150, 150, 3)
input_image = np.expand_dims(input_image, axis=0)

# Send the request to the API
url = 'http://127.0.0.1:5000/predict'
data = {
    'input': input_image.tolist()  # Convert the numpy array to a list
}

# Send the POST request
response = requests.post(url, json=data)

# Print the prediction from the API
print(response.json())

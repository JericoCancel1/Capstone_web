import tensorflow as tf
from tensorflow import keras
from keras import layers, models
# from tensorflow.keras import layers, models
import numpy as np
# from tensorflow.keras.preprocessing.image import ImageDataGenerator
from keras._tf_keras.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from tensorflow.python.keras.layers import Dense, Flatten
from tensorflow.python.keras.models import Model
from tensorflow.python.keras.callbacks import EarlyStopping
import os

# Load the dataset (assumed to be already downloaded)
data_dir = 'G:/furnituredataset'
categories = os.listdir(data_dir)

# Image parameters
img_height = 150
img_width = 150
batch_size = 32

# Use ImageDataGenerator for loading images and augmenting them
datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

# Load the data and split into training and validation sets
train_data = datagen.flow_from_directory(
    data_dir,
    target_size=(img_height, img_width),
    batch_size=batch_size,
    class_mode='categorical',
    subset='training'
)

val_data = datagen.flow_from_directory(
    data_dir,
    target_size=(img_height, img_width),
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation'
)

# Build the CNN model
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(img_height, img_width, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(512, activation='relu'),
    layers.Dense(len(categories), activation='softmax')  # Output layer for classification
])

# Compile the model
model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Train the model
history = model.fit(
    train_data,
    steps_per_epoch=train_data.samples // batch_size,
    validation_data=val_data,
    validation_steps=val_data.samples // batch_size,
    epochs=10  # You can adjust the number of epochs
)

# Save the model
model.save('my_model.keras')



# Evaluate the model
eval_result = model.evaluate(val_data)
print(f"Validation accuracy: {eval_result[1]:.2f}")

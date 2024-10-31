from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf

# Load your model
model = tf.keras.models.load_model('G:/myenv/my_model.keras')

app = Flask(__name__)

# Endpoint for making predictions
@app.route('/predict', methods=['POST'])
def predict():
    # Assuming input is JSON
    input_data = request.json['input']
    # Convert input to numpy array and reshape for the model
    input_array = np.array(input_data).reshape(1, 150, 150, 3)  # Adjust shape to match your model's expected input
    prediction = model.predict(input_array)

    # Send back the prediction as JSON
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

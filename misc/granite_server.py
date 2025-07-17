from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = Flask(__name__)
CORS(app, origins=["*"])  # Allow all origins for testing
# this line was present when this script was POST only
#CORS(app)  # Allow cross-origin requests

# load model (this will download ~16GB on first run)
model_name = "ibm-granite/granite-3.3-8b-instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16)

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        # handle preflight request
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST")
        return response
    
    # handle actual POST request
    data = request.json
    user_message = data.get('message', '')
    
    # format prompt for model
    prompt = f"<|user|>\n{user_message}\n<|assistant|>\n"
    
    # output response
    inputs = tokenizer(prompt, return_tensors="pt")
    # note sure if temperature=0.7 param is needed here
    outputs = model.generate(**inputs, max_length=512)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

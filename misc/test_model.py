from transformers import AutoModelForCausalLM, AutoTokenizer
device = "cpu"
model_path = "ibm-granite/granite-3.3-2b-base"
tokenizer = AutoTokenizer.from_pretrained(model_path)
# drop device_map if running on CPU
model = AutoModelForCausalLM.from_pretrained(model_path, device_map=device)
model.eval()
# change input text as desired
input_text = """Give me 3 short suggestions to prevent wildfires in my local area with the provided real time IoT data:

Temperature & Humidity Sensor Readings
Timestamp Temperature (F) Humidity (%)
2025-07-02 17:10:57 86 54.6
2025-07-02 17:10:26 86 54.7
2025-07-02 17:09:56 86 54.7
Gas Sensor Readings
Timestamp Status Analog Value
2025-07-02 17:10:57 No Gas 32
2025-07-02 17:10:26 No Gas 33
2025-07-02 17:09:56 No Gas 32

All cameras sunny and clear. 
"""
# tokenize the text
input_tokens = tokenizer(input_text, return_tensors="pt").to(device)
# generate output tokens
output = model.generate(**input_tokens,
                        max_length=4000)
# decode output tokens into text
output = tokenizer.batch_decode(output)
# print output
print(output)
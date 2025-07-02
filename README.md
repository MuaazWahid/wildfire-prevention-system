# 🔥 Predictive Wildfire Prevention System 🔥
A webapp to help identify and prevent wildfires

*part of our 2025 capstone project @ San Francisco Bay University*

### Customers:
- firefighters like having a birds eye view of dangerous spots and where they are distributing their resources
- environmental agencies want to empower and measure their wildfire mitigation efforts
- forest rangers would appreciate an alert system as well as a map when they are in the field
- public are at risk for loss of life and property

### Tech Stack:
- **Frontend:** html/css/js website using Leaflet & OpenStreetMap
- **Backend:** Javascript, PHP, CORS Proxy, sklearn on AlertCalifornia camera images
- **Data Sources:** AlertCalifornia | UC San Diego, CALFire/FRAP for live feed of cameras in California
- **IoT Devices/Sensors:** ESP32 (microcontroller), DHT22 (temperature & humidity), and MQ2 (gas)
  - Wi-Fi for data transmission
  - LTE for camera data transmission
  - maybe smoke, motion, air quality, and/or AI? sensors
- **ML:** scikit-learn for image classification of wildfire signs (smoke/fire)
- **Generative AI:** Hugging Face Transformers/IBM Granite LLM & Vision models for data insights, wildfire tips, and streamlining communication
- **Database:** MySQL for storing sensor data
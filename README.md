# 🔥 California Wildfire Prevention Dashboard 🔥
A web dashboard to help identify and prevent wildfires

## Objective:
prevent wildfires in California using IoT, ML, and GenAI.

### Specifications:
- Supporting only Firefox
- Map: LeafletJS, OpenStreetMap, and/or MapTiler
  - map should display iot/camera locations
- Cameras: ALERTCalifornia for streaming cameras across california
- IoT sensors: solar-powered microcontroller board streaming sensor data to a machine or DB
  - smoke/gas/air-quality/temperature/humidity sensors
- ML models running live on camera thumbnails to identify smoke/fire
- GenAI: ollama running vision and lightweight LLM
  - granite3.2-vision
  - lightweight LLM chatbot with context injection streaming output (perhaps granite3.1-moe:1b)

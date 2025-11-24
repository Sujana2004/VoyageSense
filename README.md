# VoyageSense
VoyageSense
VoyageSense is an intelligent travel planning application integrating AI models and multiple external APIs to create personalized trip plans. The project includes both backend and frontend components designed to work together for a seamless user experience.

# Project Structure
travel-planner-backend/ — Backend server handling API logic, data processing, and integration.

VoyageSenseModel.ipynb — Jupyter Notebook for downloading and running the Ollama LLaMA 3.1 8b-instruct-q4_0 model on Google Colab for travel itinerary planning.

Frontend React app located on the front branch, focusing on interactive map views and user/admin interfaces.

# Features
## User Roles
User

Dashboard

Create Trip

My Trips

Places

Chat

## Admin

Admin Dashboard

User Management

Trip Management

Chat Management

Analytics Dashboard

# Technology Stack
AI Model: LLaMA 3.1 (8B Instruct Q4_0) via Ollama in Google Colab

## External APIs:

Open Trip Planner API

Wikipedia API

Weather API

OpenStreetMap API

# Frontend: React with map visualization library

# Backend: Node.js/Express (or specify your backend framework)

# How to Use
## Backend Setup
Navigate to the travel-planner-backend/ folder.

Follow backend-specific setup and installation instructions.

Use VoyageSenseModel.ipynb notebook in Google Colab to download and use Ollama with the LLaMA model for travel planning AI features.

## Frontend Setup
Checkout the frontend branch:

git checkout front
Navigate to your frontend folder inside the repository.

Install dependencies and launch the React app to access user and admin dashboards.

### Branch Strategy
The frontend React code is maintained in a separate front branch to isolate development and avoid conflicts with the backend or other code on main.

Push frontend updates to the front branch using:

git push -u origin front

Merge frontend changes to main through pull requests after review and testing.

# Outputs of this project
![Image Description]
(https://raw.githubusercontent.com/Sujana2004/VoyageSense/images/Screenshot%202025-11-11%20194737.png)
![Screenshot]
(https://raw.githubusercontent.com/Sujana2004/VoyageSense/images/Screenshot%202025-11-11%20194737.png)



# Contribution
To contribute, please create branches from main or front depending on which part you are working on, submit pull requests, and follow code review processes to maintain project integrity.

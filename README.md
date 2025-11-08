Aniask Backend: Secure API Server
Companion Repository: This server is designed to be used with the Aniask Frontend Repository.

AniAsk Frontend Repo: https://github.com/Ali-Abdullahi/AniAI.git

Project Description
This repository contains the Node.js and Express.js backend server for the Aniask application. Its primary role is to serve as secure middleware between the client and the Gemini API, protecting sensitive keys and managing user data persistence.
The server handles all conversation logic, securely connects to the AI model, and stores chat history and metadata in a SQL database.

Requirements to Run:
To run this server locally, you must have:
Node.js and npm installed.
A Gemini API Key from Google AI Studio.

Installation and Setup:
Follow these steps to get the server running:
Clone the Repository:
git clone [https://github.com/Ali-Abdullahi/AniAIBackEnd.git]
cd AniAIBackEnd

Install Dependencies:
npm install

Environment Configuration (Crucial):
Create a file named .env in the root directory.
This file holds your private credentials. Add the following variable template:
GEMINI_API_KEY="YOUR_API_KEY_HERE" 
Note: This file is excluded from GitHub via the .gitignore for security.

Start the Server:
node server.js
The console will confirm the server is running and ready to accept requests from the frontend.

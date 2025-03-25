# Project Setup

## Clone the Repository
```sh
git clone <repository_url>
cd <repository_name>
```

## Setup Environment Variables
1. Rename `.env.example` to `.env`:
   ```sh
   mv .env.example .env
   ```
2. Open `.env` and fill in all required values.

## Firebase Setup
1. Enable **Google** and **Facebook** sign-in in Firebase Authentication.
2. Download the Firebase Admin SDK JSON file.
3. Place the JSON file inside the `config` folder.
4. Update the correct path in `firebaseConfig.js`.

## Install Dependencies
```sh
npm install
```

## Start the Server
```sh
npm start
```

## API Documentation
For full API details, visit:
[Postman Documentation](https://documenter.getpostman.com/view/27080842/2sAYkDML7i)

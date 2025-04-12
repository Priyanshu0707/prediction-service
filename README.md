# Prediction Service Backend

This repository contains the backend service for managing predictions, built using Node.js and Express.

## Objective

To build a basic backend service supporting prediction posting and retrieval.

## Task Brief

The service exposes the following endpoints:

1.  **POST `/prediction`**
    -   **Input:** -   `question` (string): The prediction question.
        -   `category` (string): The category of the prediction.
        -   `expiryTime` (timestamp): The expiration time for the prediction.
    -   **Output:**
        -   `predictionId` (string): Unique identifier for the created prediction.
        -   `message` (string): Success message.

2.  **GET `/predictions`**
    -   **Output:**
        -   Array of active predictions with their details (question, category, expiryTime, predictionId).

3.  **(Optional) POST `/opinion`**
    -   **Input:**
        -   `predictionId` (string): Identifier of the prediction.
        -   `userId` (string): Identifier of the user giving the opinion.
        -   `opinion` (string): "Yes" or "No".
        -   `amount` (number): Amount associated with the opinion.
    -   **Output:**
        -   Success message.

## Tech Requirements

-   Node.js + Express
-   Firebase or MongoDB (mock DB OK)
-   Postman for testing
-   Input validation

## Installation

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd [your-repo-name]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    -   If using Firebase, configure your Firebase project and add the credentials to your environment variables or a `.env.public` file.
    -   If using MongoDB, ensure MongoDB is running and update the connection string in your code.
    -   If using a mock DB, no additional setup is required.

4.  **Environment Variables (if applicable):**
    -   Create a `.env.public` file in the root directory.
    -   Add your database credentials or other necessary environment variables.
        ```
        FIREBASE_PROJECT_ID=your-project-id
        FIREBASE_PRIVATE_KEY_ID=your-private-key-id
        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key content here\n-----END PRIVATE KEY-----\n"
        FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
        FIREBASE_CLIENT_ID=your-client-id
        FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
        FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
        FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
        FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account-email%40your-project-id.iam.gserviceaccount.com
        ```

## Running the Application

1.  **Start the server:**
    ```bash
    npm run dev
    ```

2.  The server will start running on the specified port (usually PORT: 3000).

## Testing

1.  **Use Postman to test the endpoints:**
    -   Import the Postman collection provided in the `postman` directory (if available).
    -   Alternatively, manually create requests to the endpoints:
        -   **POST `/prediction`:** Send a JSON payload with `question`, `category`, and `expiryTime`.
        -   **GET `/predictions`:** Send a GET request to retrieve the list of predictions.
        -   **(Optional) POST `/opinion`:** Send a JSON payload with `predictionId`, `userId`, `opinion`, and `amount`.

2.  **Input Validation:**
    -   Ensure that the application validates the input data for all endpoints.
    -   Test with invalid inputs to verify that appropriate error messages are returned.
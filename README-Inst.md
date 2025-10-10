
# Development and Deployment Instructions

This document provides instructions for setting up the project for local development and deploying it to Vercel.

## Local Development

To run the application locally, follow these steps:

1.  **Install Dependencies:**
    Open a terminal and run the following command to install the necessary packages:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    After the dependencies are installed, start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

## Deployment to Vercel

To deploy the application to Vercel, follow these steps:

1.  **Push to GitHub:**
    Ensure your code is pushed to a GitHub repository.

2.  **Create a Vercel Project:**
    - Go to the Vercel dashboard and create a new project.
    - Import the GitHub repository you want to deploy.

3.  **Configure Build Settings:**
    - Vercel will automatically detect that you are using Next.js and configure the build settings accordingly.
    - You can customize the build command and output directory if needed, but the defaults should work for this project.

4.  **Deploy:**
    Click the "Deploy" button. Vercel will build and deploy your application. After the deployment is complete, you will be provided with a URL to your live site.


# SHAREKNY

## Description

**SHAREKNY** is a real-time social networking platform built using Node.js, React.js, and Socket.io. It allows users to create, view, edit, and delete posts, as well as view feeds. The platform includes robust validation and authentication across all features, ensuring a secure and seamless user experience.

## Live Demo
   
      https://socailnetwork.netlify.app/
   

## Features

- **Create New Post**: Users can create new posts and share them with others.
- **Edit Post**: Edit existing posts to update content.
- **View Post**: View detailed posts and user feeds.
- **Delete Post**: Remove posts from the platform.
- **View Feeds**: Get a real-time feed of posts from other users.
- **Sign In and Sign Up**: Secure authentication to create and access accounts.

*All features are integrated with real-time updates, ensuring the platform remains interactive and engaging.*

## Installation Instructions

To set up the Sharekny project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/BassantMaher/SocialNetworking.git
   ```
   
2. **Navigate to the project directory**:
   ```bash
   cd SocialNetworking
   ```


3. **Install client-side dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install server-side dependencies**:
   ```bash
   cd ../backend
   npm install
   ```


5. **Run the development servers**:
   - Start the backend:
     ```bash
     cd ../backend
     npm start
     ```
   - Start the frontend:
     ```bash
     cd ../frontend
     npm start
     ```

6. **Access the application**:
   - Open your browser and go to `http://localhost:3000` to view the application.

## Usage

1. **Sign Up**: Create a new account to start using the platform.
2. **Sign In**: Log in with your credentials.
3. **Create and Manage Posts**: Use the interface to create, edit, and manage your posts in real-time.
4. **View Feeds**: Stay updated with the latest posts from other users.

## Technologies Used

- **Node.js**: Backend server and API development.
- **Express.js**: Web framework for Node.js.
- **React.js**: Frontend library for building user interfaces.
- **Socket.io**: Enables real-time, bidirectional communication between web clients and servers.
- **MongoDB**: Mongoose database for storing user data and posts.
- **JWT**: JSON Web Tokens for authentication.
- **CSS/SCSS**: Styling the user interface.

## Acknowledgements

This project was developed following the **NodeJS - The Complete Guide (MVC, REST APIs, GraphQL, Deno)** course by [Maximilian Schwarzmüller](https://academind.com/).

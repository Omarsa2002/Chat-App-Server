# Chat-App-Server

This is the backend for the Chat App, built using **Node.js**, **Express**, and **MongoDB**. It provides RESTful APIs for authentication, messaging, and admin management.

## 🧰 Tech Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Joi (Validation)

## 📦 Getting Started

### Prerequisites

- Node.js >= 14
- MongoDB instance or connection string

### Installation

```bash
# Install dependencies
npm install

# Start the server
node index.js
```

> Server runs by default on `http://localhost:3000`.

## 🌐 API Endpoints

> All routes are protected by JWT authentication unless otherwise stated.

---

### 🧑‍💻 Auth Routes (`/api/auth`)

| Method | Endpoint             | Description                   |
|--------|----------------------|-------------------------------|
| POST   | `/signup`            | Register a new user           |
| POST   | `/verifyemail`       | Verify user email with code   |
| POST   | `/resendcode`        | Resend email verification code |
| POST   | `/login`             | Log in a user                 |
| POST   | `/forgetpassword`    | Send reset password email     |
| PATCH  | `/setPassword`       | Set a new password            |
| POST   | `/logout`            | Logout the authenticated user |

---

### 👥 User Routes (`/api/user`)

| Method | Endpoint                | Description                      |
|--------|-------------------------|----------------------------------|
| GET    | `/userdata`             | Get current user data            |
| GET    | `/users`                | Get list of users (with filters) |
| PATCH  | `/sendfriendrequest`    | Send a friend request            |
| PATCH  | `/acceptfriendrequest`  | Accept a friend request          |
| PATCH  | `/cancelfriendrequest`  | Cancel a sent friend request     |
| PATCH  | `/refusefriendrequest`  | Refuse a received friend request |
| PATCH  | `/removefriend`         | Remove a friend from friend list |

---

### 💬 Chat Routes (`/api/chat`)

| Method | Endpoint                 | Description                  |
|--------|--------------------------|------------------------------|
| GET    | `/chatmessages/:chatId`  | Get all messages in a chat   |

---

### 🛠️ Admin Routes (`/api/admin`)

| Method | Endpoint                       | Description                         |
|--------|--------------------------------|-------------------------------------|
| GET    | `/newregisteredcompanies`      | View newly registered companies *(Admin only)* |

---

### ⚙️ Environment Variables

Create a `.env` file with the following:

```
PORT=3000
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
```

## 📁 Project Structure

```
├── index.js                  # Entry point
├── app/
│   ├── routes-index.js
│   ├── schema-index.js
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── admin.route.js
|   |   ├── auth.validation.js
│   │   └── ...
│   └── ...
├── vercel.json               # Deployment config for Vercel
├── package.json
```


## 📄 License

This project is licensed under the MIT License.
# ProShop - MERN eCommerce Platform

A full-featured eCommerce platform built from scratch using the MERN stack (MongoDB, Express.js, React, Node.js). This project includes a complete shopping experience with user authentication, product management, shopping cart, order processing, payment integration, AI-powered semantic product search, MongoDB-native image storage, and an AI order support chatbot.

## 🌐 Live Demo

**[View Live Application](https://proshopapp1538-a6d2a1d5e767.herokuapp.com/)**

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Seeder](#database-seeder)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Learning Outcomes](#learning-outcomes)
- [License](#license)

## ✨ Features

### Customer Features
- **User Authentication**: Secure registration and login with JWT
- **Product Browsing**: View products with detailed information, images, and ratings
- **AI-Powered Semantic Search**: Product search understands meaning, not just keywords — queries like "warm jacket for winter" or "wireless audio device" surface relevant products even without exact word matches. Falls back automatically from regular keyword search to vector search when no keyword matches are found, so the experience stays seamless with no extra UI
- **Product Reviews**: Read and write product reviews and ratings
- **Shopping Cart**: Full-featured cart with add, remove, and quantity updates
- **Checkout Process**: Multi-step checkout (shipping, payment method confirmation)
- **Payment Integration**: Secure payments via PayPal and credit/debit cards
- **Order Tracking**: View order history and current order status
- **User Profile**: Manage personal information and view past orders
- **AI Order Support Chatbot**: Floating chat widget that answers questions about the logged-in user's own orders (status, payment, delivery, items) using Google's Gemini API, grounded strictly in that user's real order data with multi-turn conversation memory

### Admin Features
- **Product Management**: Create, read, update, and delete products
- **MongoDB-Native Image Storage**: Product images are stored as binary data directly inside MongoDB documents (not the filesystem), so images are automatically deleted along with their product and never orphaned
- **User Management**: View and manage registered users
- **Order Management**: View all orders and update order status
- **Mark as Delivered**: Update orders to delivered status
- **Admin Dashboard**: Centralized control panel for all admin operations

### Additional Features
- **Top Products Carousel**: Showcase featured products on homepage
- **Product Pagination**: Efficiently browse through large product catalogs
- **Product Rating System**: Average rating display with user reviews
- **Responsive Design**: Mobile-friendly interface using React-Bootstrap

## 🛠 Tech Stack

### Frontend
- **React** - UI library with functional components and hooks
- **Redux** - State management with actions and reducers
- **React Router** - Client-side routing
- **React-Bootstrap** - UI component library
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database, including native binary storage for product images
- **Mongoose** - MongoDB object modeling (ODM)

### AI & Search
- **MongoDB Atlas Vector Search** - Powers semantic product search via `$vectorSearch` aggregation
- **@xenova/transformers** (`all-MiniLM-L6-v2`) - Generates 384-dimensional product/query embeddings locally in Node, with no external API calls or per-request cost
- **Google Gemini API** (`@google/genai`) - Powers the order support chatbot, scoped to each authenticated user's own order data with conversation history for multi-turn context

### Authentication & Security
- **JWT** - JSON Web Tokens for secure authentication
- **bcrypt.js** - Password hashing

### Payment Integration
- **PayPal API** - Payment processing

### Development Tools
- **Postman** - API testing
- **Git & GitHub** - Version control
- **dotenv** - Environment variable management

## 📦 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB Atlas account** (required — Vector Search is used for semantic search, and is supported even on the free M0 tier)
- **npm** or **yarn**
- **PayPal Developer Account** (for payment integration)
- **Google AI Studio API Key** (for the order support chatbot — free tier available at [aistudio.google.com](https://aistudio.google.com))

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Omkumar-pal/Proshop.git
   cd Proshop
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables) section)

5. **Create the MongoDB Atlas Vector Search index** (required for semantic search)

   In Atlas → your cluster → **Atlas Search** tab → **Create Vector Search Index** → **Bring your own embeddings** → **JSON Editor**, using your database/`products` collection:
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "embedding",
         "numDimensions": 384,
         "similarity": "cosine"
       }
     ]
   }
   ```
   Name the index `vector_index` (must match the name used in `productController.js`).

6. **Import sample data** (also generates embeddings and loads product images into MongoDB)
   ```bash
   npm run data:import
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory and add the following:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAGINATION_LIMIT=8
GEMINI_API_KEY=your_gemini_api_key
```

### Environment Variable Descriptions:
- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port number
- `MONGO_URI`: MongoDB Atlas connection string (must include your database name, e.g. `.../proshop?...`)
- `JWT_SECRET`: Secret key for JWT token generation
- `PAYPAL_CLIENT_ID`: PayPal client ID for payment processing
- `PAGINATION_LIMIT`: Number of products per page
- `GEMINI_API_KEY`: Google Gemini API key for the order support chatbot — get a free key at [aistudio.google.com](https://aistudio.google.com)

### ⚠️ Important Security Note:

**NEVER commit your `.env` file to Git!**

Make sure your `.gitignore` file includes:
```
.env
node_modules/
```

You can create a `.env.example` file (without real values) to share the structure:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=your_secret_here
PAYPAL_CLIENT_ID=your_paypal_id_here
PAGINATION_LIMIT=8
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🗄 Database Seeder

Import or destroy sample data in the database:

```bash
# Import data (also generates embeddings and loads images into MongoDB)
npm run data:import

# Destroy data
npm run data:destroy
```

The seeder script populates the database with sample:
- Products — each with a generated vector embedding and its image stored as binary data
- Users (including admin user)
- Reviews

### Backfilling embeddings on existing data

If you add products directly to the database without going through the app (or need to regenerate embeddings), run:
```bash
npm run embeddings:backfill
```

## 💻 Usage

### Run the application

**Development mode (with hot reload):**
```bash
# Run backend and frontend concurrently
npm run dev
```

**Run backend only:**
```bash
npm run server
```

**Run frontend only:**
```bash
cd frontend
npm start
```

**Production build:**
```bash
# Build frontend
cd frontend
npm run build

# Run production server
cd ..
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Default Admin Login
```
Email: admin@email.com
Password: 123456
```

### Using Semantic Search
Just use the normal search bar. If your search term doesn't exactly match a product name, the backend automatically falls back to AI-powered semantic search — try phrases like *"good for taking photos"* or *"smart home assistant"* instead of exact product names.

### Using the Order Support Chatbot
1. Log in as any user with at least one order on their account.
2. Click the 💬 button in the bottom-right corner (visible on every page once logged in).
3. Ask questions like *"What's the status of my last order?"* or *"Has my order been delivered yet?"*
4. The assistant only ever sees and answers from that logged-in user's own order data, and remembers the last several turns of the conversation for natural follow-ups.

## 📡 API Endpoints

### Products
```
GET    /api/products              - Get all products (keyword search, auto-falls back to semantic search if no keyword matches)
GET    /api/products/:id          - Get single product
GET    /api/products/:id/image    - Serve a product's image (stored as binary in MongoDB)
POST   /api/products               - Create product (Admin)
PUT    /api/products/:id           - Update product (Admin) — regenerates embedding, updates image only if a new one is uploaded
DELETE /api/products/:id           - Delete product (Admin) — image is deleted automatically since it's part of the same document
POST   /api/products/:id/reviews - Create product review
GET    /api/products/top           - Get top rated products
```

### Users
```
POST   /api/users/auth         - Authenticate user & get token
POST   /api/users              - Register user
POST   /api/users/logout       - Logout user
GET    /api/users/profile      - Get user profile
PUT    /api/users/profile      - Update user profile
GET    /api/users              - Get all users (Admin)
DELETE /api/users/:id          - Delete user (Admin)
GET    /api/users/:id          - Get user by ID (Admin)
PUT    /api/users/:id          - Update user (Admin)
```

### Orders
```
POST   /api/orders             - Create new order
GET    /api/orders/myorders    - Get logged in user orders
GET    /api/orders/:id         - Get order by ID
PUT    /api/orders/:id/pay     - Update order to paid
PUT    /api/orders/:id/deliver - Update order to delivered (Admin)
GET    /api/orders             - Get all orders (Admin)
```

### Upload
```
POST   /api/upload             - Upload a product image (returns base64 data + content type for MongoDB storage)
```

### Chat
```
POST   /api/chat               - Send a message to the AI order support assistant (Private — requires logged-in user)
```

## 🌐 Deployment

### Deploying to Heroku

> **Note:** Heroku no longer offers a free tier (removed in November 2022). The cheapest option is the **Eco dyno** at $5/month, which sleeps after 30 minutes of inactivity.

1. **Create a Heroku app**
   ```bash
   heroku create proshop-app
   ```

2. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set PAYPAL_CLIENT_ID=your_paypal_client_id
   heroku config:set GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

> Since product images now live in MongoDB rather than the filesystem, they persist correctly across Heroku dyno restarts — unlike disk-based uploads, which are wiped on every restart.

### Deploying to Other Platforms

This application can also be deployed to:
- **Vercel** (Frontend)
- **Railway** (Full stack)
- **Render** (Full stack)
- **DigitalOcean** (VPS)
- **AWS EC2** (VPS)

## 📚 Learning Outcomes

Building this project provided hands-on experience with:

- **React Development**: Functional components, hooks (useState, useEffect, useSelector, useDispatch), and component architecture
- **State Management**: Redux implementation with actions, reducers, and store configuration
- **Backend Development**: RESTful API design, Express middleware, and route handling
- **Database Management**: MongoDB and Mongoose ODM for data modeling, queries, and binary (BSON) data storage
- **Vector Search & Embeddings**: Generating text embeddings locally with a transformer model, storing them in MongoDB, and querying via Atlas Vector Search's `$vectorSearch` aggregation stage to power meaning-based product search
- **Authentication**: JWT implementation with custom authentication middleware
- **Payment Integration**: PayPal API integration for secure transactions
- **AI Integration**: Building a secure, user-scoped LLM-powered chat feature with Google's Gemini API, including multi-turn conversation context and graceful handling of upstream API errors/rate limits
- **Error Handling**: Custom error handling middleware and user-friendly error messages
- **Security Best Practices**: Password hashing, protected routes, environment variables, and ensuring AI features never leak data across users
- **Full Stack Integration**: Connecting React frontend with Express backend
- **Deployment**: Environment configuration and production deployment strategies

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Omkumar-pal/Proshop/issues).

## 👤 Author

**Om Kumar Pal**
- GitHub: [@OM_KUMAR_PAL](https://github.com/Omkumar-pal)

## ⭐️ Show your support

Give a ⭐️ if this project helped you!

---

**Note**: This is a learning project built for educational purposes. Some features may need additional refinement for production use.

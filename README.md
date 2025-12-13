# ProShop - MERN eCommerce Platform

A full-featured eCommerce platform built from scratch using the MERN stack (MongoDB, Express.js, React, Node.js). This project includes a complete shopping experience with user authentication, product management, shopping cart, order processing, and payment integration.

## 🌐 Live Demo

**[View Live Application](https://proshopapp1538-a6d2a1d5e767.herokuapp.com/)**

![ProShop Demo](https://via.placeholder.com/800x400?text=ProShop+Demo)

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
- [Screenshots](#screenshots)
- [Learning Outcomes](#learning-outcomes)
- [License](#license)

## ✨ Features

### Customer Features
- **User Authentication**: Secure registration and login with JWT
- **Product Browsing**: View products with detailed information, images, and ratings
- **Product Search**: Find products quickly with search functionality
- **Product Reviews**: Read and write product reviews and ratings
- **Shopping Cart**: Full-featured cart with add, remove, and quantity updates
- **Checkout Process**: Multi-step checkout (shipping, payment method confirmation)
- **Payment Integration**: Secure payments via PayPal and credit/debit cards
- **Order Tracking**: View order history and current order status
- **User Profile**: Manage personal information and view past orders

### Admin Features
- **Product Management**: Create, read, update, and delete products
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
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling (ODM)

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
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**
- **PayPal Developer Account** (for payment integration)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/proshop.git
   cd proshop
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

5. **Import sample data** (optional)
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
```

### Environment Variable Descriptions:
- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port number
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PAYPAL_CLIENT_ID`: PayPal client ID for payment processing
- `PAGINATION_LIMIT`: Number of products per page

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
```

## 🗄 Database Seeder

Import or destroy sample data in the database:

```bash
# Import data
npm run data:import

# Destroy data
npm run data:destroy
```

The seeder script will populate the database with sample:
- Products
- Users (including admin user)
- Reviews

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

## 📡 API Endpoints

### Products
```
GET    /api/products          - Get all products (with pagination)
GET    /api/products/:id      - Get single product
POST   /api/products           - Create product (Admin)
PUT    /api/products/:id       - Update product (Admin)
DELETE /api/products/:id       - Delete product (Admin)
POST   /api/products/:id/reviews - Create product review
GET    /api/products/top       - Get top rated products
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

## 🌐 Deployment

### Deploying to Heroku

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
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

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
- **Database Management**: MongoDB and Mongoose ODM for data modeling and queries
- **Authentication**: JWT implementation with custom authentication middleware
- **Payment Integration**: PayPal API integration for secure transactions
- **Error Handling**: Custom error handling middleware and user-friendly error messages
- **Security Best Practices**: Password hashing, protected routes, and environment variables
- **Full Stack Integration**: Connecting React frontend with Express backend
- **Deployment**: Environment configuration and production deployment strategies

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/proshop/issues).

## 👤 Author

**Om Kumar Pal**
- GitHub: [@OM_KUMAR_PAL](https://github.com/Omkumar-pal)

## ⭐️ Show your support

Give a ⭐️ if this project helped you!

---

**Note**: This is a learning project built for educational purposes. Some features may need additional refinement for production use.

# 🍔 Campus Bytee — Campus Food Pre-Ordering Platform

**Campus Bytee** is a campus-focused food ordering and pre-ordering web application built to make ordering food inside a university campus faster, simpler, and more convenient.

Students can explore food courts, restaurants and outlets, browse menus, add items to a cart, place orders, and make payments through **Razorpay**. Restaurant administrators get a dedicated interface to manage outlets, menu items, and incoming orders.

The project is built with **React + Vite** and uses **Firebase Firestore** as the backend database.

---

## 🚀 What It Does

- 🏫 Provides a dedicated food-ordering experience for a campus environment
- 🍽️ Displays food courts, restaurants, outlets and menu items
- 🛒 Allows students to add, update and remove items from their cart
- 🔐 Provides user login functionality
- 📦 Stores placed orders in Firebase Firestore
- 💳 Supports Razorpay Checkout for online payments
- 👨‍🍳 Provides a separate restaurant/admin workflow
- 🏪 Allows admins to manage restaurant outlets and menu data
- 📋 Provides an admin order-management interface
- ⏱️ Includes order preparation timers for restaurant/admin workflows
- 💾 Preserves user/admin sessions using browser storage
- 🧭 Includes back/forward navigation handling inside the application
- 📱 Uses a responsive, component-based React interface

---

## ✨ Key Features

### 👨‍🎓 Student / User Side

| Feature | Description |
|---|---|
| Splash Screen | Branded starting screen before entering the application |
| Login | User authentication/login flow |
| Food Courts | Browse available campus food courts |
| Restaurants | Explore restaurants available inside a food court |
| Outlets | Select a particular restaurant outlet |
| Menu | Browse food items and their prices |
| Cart | Add, remove and update item quantities |
| Order Placement | Place an order after completing checkout |
| Online Payment | Razorpay Checkout integration |
| Order History | View previously placed orders |
| Contact Us | Access the application's contact page |
| Session Persistence | User session survives page refresh within the browser tab |

### 🧑‍🍳 Restaurant / Admin Side

| Feature | Description |
|---|---|
| Admin Registration | Restaurant/admin registration flow |
| Admin Login/Session | Restaurant session persistence |
| Dashboard | Dedicated admin home interface |
| Outlet Management | Manage restaurant outlets |
| Menu Management | Add/edit/manage food menu information |
| Order Management | View and manage incoming customer orders |
| Order Timer | Start, stop and manage preparation timers |
| Logout | Clear restaurant/admin session |

---

## 💳 Payment System

Campus Bytee uses **Razorpay Checkout** for online payments.

The payment flow is designed so that an order is saved to Firestore **after Razorpay reports a successful payment**.

### Payment Flow

```text
Student
   │
   ▼
Add food items to Cart
   │
   ▼
Login
   │
   ▼
Razorpay Checkout
   │
   ├── Payment Failed / Cancelled
   │          │
   │          ▼
   │      No Order Created
   │
   └── Payment Successful
              │
              ▼
       Save Order in Firestore
              │
              ▼
          Order Placed
```

The current frontend reads the Razorpay public Key ID from:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

> **Security:** Never commit `.env` files or Razorpay secret keys to GitHub. Only the public Razorpay Key ID should be exposed to the frontend.

---

## 🔥 Firebase

Firebase is used as the application's backend/database layer.

The project uses **Firebase Firestore** for storing application data such as users, restaurants, menu information and orders.

The frontend initializes Firebase through:

```text
src/firebase.js
```

Orders are stored under the user's Firestore document using a structure similar to:

```text
User Login
└── <userDocId>
    └── Orders
        ├── order 1
        ├── order 2
        └── ...
```

Each order contains information such as:

- Food item ID
- Food item name
- Price
- Quantity
- Item subtotal
- Restaurant name
- Outlet name
- Total amount
- Payment mode
- Razorpay payment ID
- Razorpay order ID
- Order status
- Order timestamp

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | Frontend UI and component architecture |
| **Vite 8** | Development server and production build tool |
| **JavaScript (ES Modules)** | Application logic |
| **Tailwind CSS 4** | Utility-first styling |
| **Firebase 12** | Authentication/database services |
| **Cloud Firestore** | Cloud NoSQL database |
| **Razorpay Checkout** | Online payment processing |
| **React Router DOM** | Client-side routing support |
| **ESLint** | Code quality and linting |
| **HTML5 / CSS3** | Structure and styling |

---

## 📁 Project Structure

```text
campus-bytee/
├── public/
│   ├── upi-qr.jpeg
│   └── upi-qr.png
├── src/
│   ├── assets/
│   │   ├── logo.png
│   │   └── paratha.png
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminEditPage.jsx
│   │   │   ├── AdminHomePage.jsx
│   │   │   ├── AdminManagePage.jsx
│   │   │   ├── AdminOrdersPage.jsx
│   │   │   └── AdminRegisterPage.jsx
│   │   ├── CartPopup.jsx
│   │   ├── ContactUsPage.jsx
│   │   ├── FoodCourtPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MenuPage.jsx
│   │   ├── OutletsPage.jsx
│   │   ├── SplashScreen.jsx
│   │   └── YourOrderPage.jsx
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

### Important Files

#### `src/App.jsx`

The main application controller.

It manages:

- Current page
- User session
- Admin session
- Restaurant/outlet selection
- Shopping cart
- Cart quantity updates
- Order timers
- Navigation history
- User logout
- Admin logout

The application uses React state to coordinate these features between the different pages/components.

---

#### `src/firebase.js`

Contains the Firebase initialization and Firestore configuration used by the application.

All Firebase-related operations are connected through this configuration.

---

#### `src/components/HomePage.jsx`

Main student-facing home page.

Provides access to the primary campus food-ordering experience.

---

#### `src/components/FoodCourtPage.jsx`

Displays available food courts and allows users to select where they want to order from.

---

#### `src/components/OutletsPage.jsx`

Displays restaurant/outlet choices after the user selects a restaurant or food court.

---

#### `src/components/MenuPage.jsx`

Displays the selected outlet's menu and allows users to add food items to their cart.

---

#### `src/components/CartPopup.jsx`

Handles the shopping cart and checkout experience.

Responsibilities include:

- Displaying cart items
- Updating quantities
- Removing items
- Calculating total amount
- Showing payment information
- Opening Razorpay Checkout
- Handling successful/failed payment states
- Saving successful orders to Firestore
- Showing the order-success confirmation

---

#### `src/components/YourOrderPage.jsx`

Displays the user's placed orders and order information.

---

### Admin Components

```text
src/components/admin/
├── AdminHomePage.jsx
├── AdminRegisterPage.jsx
├── AdminManagePage.jsx
├── AdminEditPage.jsx
└── AdminOrdersPage.jsx
```

These components provide the restaurant/admin side of Campus Bytee.

They are responsible for restaurant management, outlet/menu editing, order handling and the admin dashboard.

---

## 🔄 Application Flow

### Student Flow

```text
Splash Screen
      │
      ▼
    Home
      │
      ▼
  Food Court
      │
      ▼
 Restaurant
      │
      ▼
   Outlet
      │
      ▼
    Menu
      │
      ▼
    Cart
      │
      ▼
    Login
      │
      ▼
 Razorpay Checkout
      │
      ▼
 Payment Success
      │
      ▼
 Firestore Order
      │
      ▼
 Order Confirmation
```

### Restaurant/Admin Flow

```text
Admin Entry
    │
    ├── Register
    │
    └── Login
         │
         ▼
     Admin Home
         │
         ├── Manage Outlets
         │
         ├── Edit Menu
         │
         └── Manage Orders
                    │
                    ▼
              Order Timer
```

---

## 🧠 State Management

Campus Bytee currently uses **React's built-in state management** instead of introducing a large external state-management library.

Important state maintained by `App.jsx` includes:

```text
User
├── isLoggedIn
├── userName
└── userDocId

Restaurant
├── selectedRestaurant
└── selectedOutlet

Cart
├── cartItems
├── quantity
└── total

Admin
├── restaurantName
├── restaurantDocId
└── adminSelectedOutlet

Orders
└── orderTimers
```

This keeps the application relatively lightweight and easy to understand.

---

## 💾 Session Management

Two browser storage mechanisms are used:

### User Session

`sessionStorage` is used for the user session.

This allows the session to survive a page refresh while being cleared when the browser tab/session ends.

### Admin Session

`localStorage` is used for the admin session so that the restaurant/admin session can persist across browser restarts.

---

## 🧮 Cart Logic

The cart is maintained in React state.

### Add Item

If an item already exists in the cart, its quantity is increased.

Otherwise, a new item is added with an initial quantity.

### Update Quantity

```text
+  → quantity increases
−  → quantity decreases
0  → item is removed
```

### Total Calculation

```text
Item Total = Price × Quantity

Cart Total = Sum of all Item Totals
```

---

## ⏱️ Order Timers

The admin side includes preparation timers.

Timers are maintained in application state and updated every second.

Each timer keeps track of:

```text
timeLeft
totalSec
timerRunning
```

Admins can:

- Start a timer
- Stop a timer
- Clear a timer

---

## ⚙️ Getting Started

### Requirements

Make sure the following are installed:

- **Node.js**
- **npm**
- **Git**
- A Firebase project
- Razorpay account/test credentials for payment testing

Recommended:

```text
Node.js 20+
npm 10+
```

---

## 📥 Installation

Clone the repository:

```bash
git clone https://github.com/kuldeep10011/NextGenProject.git
```

Move into the project:

```bash
cd NextGenProject
```

Install dependencies:

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root.

Example:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Do **not** commit your `.env` file.

A recommended `.gitignore` should include:

```text
node_modules/
dist/
.env
.env.local
.env.*.local
```

---

## 🔥 Firebase Setup

1. Create a Firebase project.
2. Enable the required Firebase services.
3. Create/configure your Firestore database.
4. Configure your Firebase web application.
5. Update the Firebase configuration used by `src/firebase.js`.
6. Configure Firestore security rules according to your application requirements.

> For production deployment, avoid exposing private credentials and make sure Firestore security rules properly restrict reads and writes.

---

## 💳 Razorpay Setup

For testing:

1. Create/configure a Razorpay account.
2. Use **Test Mode**.
3. Obtain your Razorpay **Key ID**.
4. Add it to `.env`:

```env
VITE_RAZORPAY_KEY_ID=your_test_key_id
```

The application loads the Razorpay Checkout script when payment is initiated.

> **Important:** A production payment system should create Razorpay Orders on a trusted backend/server and verify the Razorpay payment signature before treating an order as paid. The current project is primarily structured as a campus/project application and should be hardened before handling real payments at scale.

---

## ▶️ Run the Project

Start the development server:

```bash
npm run dev
```

Vite will provide a local URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

---

## 🏗️ Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🧹 Linting

Run ESLint:

```bash
npm run lint
```

---

## 📦 Available NPM Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🧪 Testing Payments

During development, use **Razorpay Test Mode** and Razorpay's official test payment details.

Do not use real payment credentials while testing the application.

---

## 🔒 Security Notes

- Never commit `.env` files.
- Never expose Razorpay Secret Key in frontend code.
- Use Firebase Firestore Security Rules for production.
- Validate user permissions before allowing restaurant/admin operations.
- Payment success should be verified server-side before marking an order as paid in production.
- Do not trust client-side payment callbacks alone for financial confirmation.

---

## 🚧 Future Improvements

Possible improvements for future versions:

- 📍 Campus/location-based restaurant discovery
- 🔔 Real-time order status notifications
- 📱 Progressive Web App / mobile application
- 🧾 Digital receipts
- ⭐ Food and restaurant ratings
- ❤️ Favourite food items
- 🔎 Advanced menu search and filtering
- 📊 Restaurant sales analytics
- 👨‍💼 More granular admin roles
- 🔐 Stronger server-side authentication and authorization
- 💳 Backend-based Razorpay Order creation and signature verification
- 📦 Better order lifecycle tracking
- 📈 Admin dashboard analytics
- ☁️ Production deployment with proper environment management

---

## 📌 Project Status

**Campus Bytee is an actively developed academic/project application.**

The current version focuses on the complete campus food-ordering workflow:

```text
Browse → Select → Add to Cart → Login → Pay → Place Order
```

with a separate restaurant/admin management workflow.

---

## 👨‍💻 Developer

**Kuldeep Gogoi**
**Ishan Nain**
**Abhishek Rajput**

Project Repository:  
https://github.com/kuldeep10011/NextGenProject

---

## 📄 License

This project is developed for academic, learning and project demonstration purposes.

If you want to reuse or extend the project, please check with the project owner before redistributing it.

---

## ⭐ Support

If you find **Campus Bytee** useful or interesting, consider giving the repository a ⭐ on GitHub.

**Built with React, Firebase & Razorpay for a better campus food-ordering experience. 🍔**

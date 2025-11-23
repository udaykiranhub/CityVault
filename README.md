Here is a **clean, simple, professional README.md** tailored *exactly* for your project structure and commands.
You can directly paste this into your repository’s `README.md` file.

---

# **CityVault – Full Stack Blockchain File Management System**

CityVault is a decentralized file management system built using:

* **Frontend:** React (Vite), React Bootstrap, JWT Auth
* **Backend:** Node.js, Express.js, MongoDB, JWT
* **Smart Contracts:** Solidity, Foundry (forge)
* **Blockchain:** Local RPC (Anvil or Hardhat)

The system provides **role-based dashboards** for
✔️ Users
✔️ HOD
✔️ Commissioner

It supports login → OTP verification → dashboard access and IPFS + on-chain storage.

---

## **📁 Project Structure**

```
CityVault/
│
├── backend/         # Node.js + Express + MongoDB API
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   └── server.js
│
├── contract/        # Solidity + Foundry smart contract
│   ├── src/
│   ├── script/
│   └── test/
│
├── frontend/        # React (Vite) application
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal/
│   │   │   ├── Navbar/
│   │   │   └── Dashboard/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   └── index.html
│
└── README.md
```

---

## **🚀 How to Run the Project**

### **1️⃣ Start the Frontend**

```
cd frontend
npm install
npm run dev
```

---

### **2️⃣ Start the Backend**

```
cd backend
npm install
npm run dev
```

Backend automatically loads environment variables (DB, JWT secret, OTP API, etc.).

---

### **3️⃣ Deploy the Smart Contract (Foundry)**

Make sure your local blockchain RPC is running:

```
anvil
```

Then deploy:

```
cd contract
forge script script/CityVault.s.sol:CityVaultScript \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --broadcast
```

After deployment, copy the **contract address** into your frontend config.

---

## **🧩 Features Implemented**

### ✅ Authentication

* Register (name, phone, password)
* Login (phone, password)
* OTP verification
* JWT stored in browser
* Token verification using `/me` route

### ✅ Role-Based Dashboards

* **UserDashboard** → Upload files to IPFS + send to HOD
* **HODDashboard** → Review and forward files
* **CommissionerDashboard** → Final approvals

### ✅ UI/UX

* React Bootstrap
* Neon blue theme
* Modal-based login/register
* Optimized component structure
* React Router DOM
* No extra CSS files (only inline + Bootstrap)

---

## **🛠 Tech Stack**

### **Frontend**

* React (Vite)
* React Bootstrap
* Axios
* JWT & Protected Routes
* React Router DOM

### **Backend**

* Express.js
* MongoDB & Mongoose
* JWT Authentication
* MSG91 or custom OTP API

### **Smart Contract**

* Solidity
* Foundry (forge, anvil)
* Role-based access
* IPFS hash storage

---

## **📌 Environment Variables Required**

Create `.env` inside **backend/**:

```
MONGO_URI=your_database_url
JWT_SECRET=your_jwt_secret
MSG91_AUTHKEY=xxxx
MSG91_SENDERID=xxxx
```

---

## **📜 License**

MIT License © 2025 CityVault Team

---

## **✨ Author**

**Uday Kiran Pedda**
MERN + Blockchain Developer
Solidity | React | Node.js | Foundry

---

If you want, I can also generate:

✅ A **GitHub-friendly README with badges & images**
✅ A **full architecture diagram (PNG)**
✅ A **logo + neon theme branding**
✅ A **setup script**

Just tell me!

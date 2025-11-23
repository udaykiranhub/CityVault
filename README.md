Here is the **same content with corrected alignment, spacing, formatting, and consistency** — clean and professional:

---

# **CityVault – Blockchain-Based File Management System**

CityVault is a decentralized file and workflow management platform built using:

* **Frontend:** React (Vite), React Bootstrap
* **Backend:** Express.js, MongoDB, Node.js
* **Blockchain:** Solidity, Foundry, IPFS, Polygon, IPFS Storage, Alchemy Node, Anvil

The system supports **admin-created accounts**, OTP-based login, JWT authentication, and **role-based dashboards** for Users, HOD, and Commissioner.

---

## **📁 Project Structure**

```
CityVault/
│
├── backend/        
├── contract/       
└── frontend/        
```

---

## **🚀 Running the Project**

### **Frontend**

```
cd frontend
npm install
npm run dev
```

### **Backend**

```
cd backend
npm install
npm run dev
```

### **Smart Contract Deployment (Foundry)**

Start local RPC:

```
anvil
```

Deploy:

```
cd contract
forge script script/CityVault.s.sol:CityVaultScript \
  --rpc-url http://127.0.0.1:8545 \
  --private-key <your-private-key> \
  --broadcast
```

---

## **✨ Key Features**

### **Authentication**

* Admin creates all accounts (User / HOD / Commissioner)
* Login with credentials
* OTP verification
* JWT-based session handling

### **Role-Based Dashboards**

* **User:** Upload to IPFS → send to HOD
* **HOD:** Review → forward
* **Commissioner:** Final approval

---

If you want, I can create a **fully polished README with badges, images, architecture diagram, and contribution guide**.

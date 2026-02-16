# 🔍 Rank Checker

> 📊 Track brand visibility on Google search results and identify competitor presence in the top 10 organic listings.

A full-stack web application that allows you to search your brand names on **Google**, compare search results against your registered domains, and instantly determine which results belong to your brand versus competitors.

---

## ✨ Key Features

### 🏷 Brand Management
- ➕ Add new brands  
- ✏️ Edit existing brands  
- 🗑 Delete brands  

### 🌐 Domain Management
- 🔗 Associate multiple domains with each brand  
- 🧩 Organize and manage brand-owned domains  

### 🔎 Google Search Automation
- 🌏 Automatically search Google  
- 📄 Extract top 10 organic results  
- ⚡ Real-time scraping using Puppeteer  

### 📊 Results Comparison
- ✅ Identify "Ours" domains  
- ❌ Identify competitor domains  
- 📈 Instant visibility analysis  

---

## 🛠 Tech Stack

### ⚙️ Backend
- 🟢 Node.js
- 🚀 Express.js
- 🐘 PostgreSQL
- 🤖 Puppeteer (Web Scraping)

### 🎨 Frontend
- ⚛️ React
- 🧭 React Router
- 📡 Axios

---

## 📦 Prerequisites

Before starting, make sure you have:

- 🟢 Node.js (v16+)
- 🐘 PostgreSQL (v12+)
- 📦 npm or yarn

---

## 🚀 Installation

### 1️⃣ Navigate to Project

```bash
cd brand-search-app
```

---

### 2️⃣ Setup PostgreSQL Database

```bash
psql -U postgres
CREATE DATABASE brand_search_db;
\q
```

Run schema:

```bash
psql -U postgres -d brand_search_db -f backend/schema.sql
```

---

### 3️⃣ Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brand_search_db
DB_USER=postgres
DB_PASSWORD=your_actual_password
PORT=5000
NODE_ENV=development
```

Start backend:

```bash
npm start
# or
npm run dev
```

Backend runs on:  
👉 `http://localhost:5000`

---

### 4️⃣ Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

Frontend runs on:  
👉 `http://localhost:3000`

---

## 📖 Usage Guide

### 🏷 Manage Brands
1. Navigate to **Brand Management**
2. Create a new brand
3. Add associated domains (e.g., `asia100.co.id`)
4. Edit or delete as needed

### 🔎 Perform Brand Search
1. Go to **Search Page**
2. Select brand
3. Click **Search**
4. Application will:
   - 🌏 Search Google 
   - 📄 Extract top 10 results
   - 🔍 Compare domains
   - 📊 Display "Ours" vs "Not Ours"

---

## 🔗 API Endpoints

### 🏷 Brands
- `GET /api/brands`
- `GET /api/brands/:id`
- `POST /api/brands`
- `PUT /api/brands/:id`
- `DELETE /api/brands/:id`

### 🌐 Domains
- `POST /api/brands/:brandId/domains`
- `DELETE /api/domains/:domainId`

### 🔎 Search
- `POST /api/search/:brandId`

---

## 🏗 Project Structure

```
brand-search-app/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── schema.sql
│   └── server.js
│
└── frontend/
    ├── public/
    └── src/
```

---

## ⚠️ Important Notes

### 🚦 Google Scraping Limitations
- ⏱ Rate limiting may occur
- 🧩 CAPTCHA challenges possible
- 🚫 IP blocking if requests are excessive
- 🌍 Results may vary due to personalization

### 🌐 Domain Matching Logic
- Case-insensitive exact matching
- `asia100.co.id` ≠ `www.asia100.co.id`
- Add both versions if necessary

---

## 🛠 Troubleshooting

### ❌ Backend Issues
- Check PostgreSQL status  
- Verify `.env` credentials  
- Ensure port 5000 is available  

### ❌ Frontend Connection Issues
- Confirm backend is running  
- Check proxy configuration  

### ❌ Puppeteer Errors
Install Chromium dependencies if required:

```bash
sudo apt-get install -y chromium-browser
```

---

## 🚀 Future Enhancements

- 🗂 Save search history
- ⏰ Scheduled automatic searches
- 📧 Email notifications
- 📤 Export to CSV/PDF
- 🌍 Multiple search regions
- 🔄 Proxy rotation system
- 🔎 Multi-search engine support

---

## 📄 License

This project is provided for educational and internal use.

---

## 💬 Support

For issues or questions:
- Check backend & frontend console logs
- Verify database connection
- Ensure Puppeteer dependencies are installed"# Rank-Checker" 

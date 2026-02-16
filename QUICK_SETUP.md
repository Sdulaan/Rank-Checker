# Quick Setup Guide

Follow these steps to get your Brand Search Application up and running quickly.

## Step 1: Database Setup (5 minutes)

```bash
# 1. Create PostgreSQL database
psql -U postgres
CREATE DATABASE brand_search_db;
\q

# 2. Create tables
cd brand-search-app/backend
psql -U postgres -d brand_search_db -f schema.sql
```

## Step 2: Backend Setup (3 minutes)

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL password

# 3. Start the server
npm start
```

Backend should now be running on http://localhost:5000

## Step 3: Frontend Setup (3 minutes)

```bash
# In a new terminal
cd frontend
npm install
npm start
```

Frontend should open automatically at http://localhost:3000

## Step 4: Add Your First Brand (2 minutes)

1. Open http://localhost:3000 in your browser
2. Click "Brand Management"
3. Enter a brand name (e.g., "ASIA100") and click "Add Brand"
4. Click on the brand name
5. Add domains for that brand (e.g., "asia100.co.id")

## Step 5: Search! (1 minute)

1. Click "Search" in the navigation
2. Select your brand from dropdown
3. Click "Search"
4. View results showing which top 10 Google results are yours!

## Common Issues

**Can't connect to database?**
- Make sure PostgreSQL is running: `sudo service postgresql start`
- Check your password in `.env` file

**Port already in use?**
- Backend: Change PORT in `.env` file
- Frontend: It will prompt you to use a different port

**Puppeteer errors?**
- Install Chromium: `sudo apt-get install chromium-browser`

## That's it!

You now have a fully functional brand search tracking application.

Total setup time: ~15 minutes

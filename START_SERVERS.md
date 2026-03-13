# 🚀 Start Servers Guide

## Quick Start - Both Servers

### Option 1: Two Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd hospital-backend
npm run start:dev
```
✅ Backend runs on: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd care-connect-hub
npm install  # First time only
npm run dev
```
✅ Frontend runs on: `http://localhost:5173`

---

### Option 2: Windows PowerShell (Single Command)

```powershell
# Start both servers in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd hospital-backend; npm run start:dev"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd care-connect-hub; npm run dev"
```

---

### Option 3: Windows CMD (Single Command)

```cmd
start cmd /k "cd hospital-backend && npm run start:dev"
timeout /t 3
start cmd /k "cd care-connect-hub && npm run dev"
```

---

## 🔍 Verify Servers Are Running

### Check Backend
```bash
curl http://localhost:3000/api
```
Expected: JSON response or "Cannot GET /api"

### Check Frontend
Open browser: `http://localhost:5173`

### Check WebSocket
Browser console should show:
```
[WebSocket] Connected to server
```

---

## 🛑 Stop Servers

### Windows
- Press `Ctrl + C` in each terminal
- Or close the terminal windows

### Kill Processes (if stuck)
```powershell
# Kill backend
Get-Process -Name node | Where-Object {$_.Path -like "*hospital-backend*"} | Stop-Process

# Kill frontend
Get-Process -Name node | Where-Object {$_.Path -like "*care-connect-hub*"} | Stop-Process
```

---

## 📝 First Time Setup

### 1. Install Backend Dependencies
```bash
cd hospital-backend
npm install
```

### 2. Setup Database (PostgreSQL)
```bash
# Install PostgreSQL if not installed
# Create database
createdb hospital_db

# Run migrations
npm run migration:run

# Seed data (optional)
npm run seed
```

### 3. Configure Backend Environment
```bash
cd hospital-backend
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Install Frontend Dependencies
```bash
cd care-connect-hub
npm install
```

### 5. Configure Frontend Environment
Already configured in `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WEBSOCKET_URL=http://localhost:3000
VITE_WEBSOCKET_AUTO_CONNECT=true
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Problem:** Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in hospital-backend/.env
PORT=3001
```

### Frontend Won't Start

**Problem:** Port 5173 already in use

**Solution:** Vite will automatically use next available port (5174, 5175, etc.)

### Database Connection Error

**Problem:** Cannot connect to PostgreSQL

**Solutions:**
1. Check PostgreSQL is running
2. Verify credentials in `hospital-backend/.env`
3. Ensure database exists: `createdb hospital_db`
4. Check PostgreSQL port (default 5432)

### CORS Errors

**Problem:** CORS policy blocking requests

**Solution:** Verify backend `main.ts` has:
```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

---

## 📊 Server Status Dashboard

### Backend Health Check
```bash
curl http://localhost:3000/api/health
```

### Frontend Health Check
Open: `http://localhost:5173`

### WebSocket Status
Check browser console for:
```
[WebSocket] Connected to server
```

---

## 🔄 Restart Servers

### Quick Restart
```bash
# Stop both (Ctrl+C in terminals)
# Then start again with commands above
```

### Full Restart (with cache clear)
```bash
# Backend
cd hospital-backend
rm -rf node_modules
npm install
npm run start:dev

# Frontend
cd care-connect-hub
rm -rf node_modules
npm install
npm run dev
```

---

## 📝 Development Workflow

### 1. Start Servers
```bash
# Terminal 1
cd hospital-backend && npm run start:dev

# Terminal 2
cd care-connect-hub && npm run dev
```

### 2. Make Changes
- Backend changes auto-reload (watch mode)
- Frontend changes auto-reload (HMR)

### 3. Test Changes
- Check browser console
- Monitor Network tab
- Verify API responses

### 4. Stop Servers
- `Ctrl + C` in each terminal

---

## 🎯 Quick Commands Reference

| Task | Command |
|------|---------|
| Start Backend | `cd hospital-backend && npm run start:dev` |
| Start Frontend | `cd care-connect-hub && npm run dev` |
| Build Backend | `cd hospital-backend && npm run build` |
| Build Frontend | `cd care-connect-hub && npm run build` |
| Run Tests | `npm run test` (in respective directory) |
| Lint Code | `npm run lint` (in respective directory) |
| Database Seed | `cd hospital-backend && npm run seed` |

---

## ✅ Success Indicators

When everything is working:

1. **Backend Terminal:**
   ```
   🚀 Hospital Backend is running on: http://localhost:3000/api
   📡 WebSocket server is running on: ws://localhost:3000
   ```

2. **Frontend Terminal:**
   ```
   VITE v5.4.19  ready in XXX ms
   ➜  Local:   http://localhost:5173/
   ```

3. **Browser Console:**
   ```
   [WebSocket] Connected to server
   ```

4. **Browser Network Tab:**
   - API calls to `http://localhost:3000/api/*`
   - WebSocket connection to `ws://localhost:3000`

---

## 🎉 You're Ready!

Both servers are now running and connected. Start building features!

**Next Steps:**
1. Open `http://localhost:5173` in browser
2. Try login/register
3. Test API calls in Network tab
4. Check real-time updates with WebSocket
5. Start integrating components with API

**Need Help?**
- Check `BACKEND_CONNECTION_GUIDE.md` for API reference
- See `INTEGRATION_EXAMPLES.md` for code examples
- Review `CONNECTION_COMPLETE.md` for summary

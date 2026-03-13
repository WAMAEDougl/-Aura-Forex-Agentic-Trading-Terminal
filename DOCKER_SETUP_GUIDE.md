# Docker Setup Guide for Hospital Backend

## Prerequisites

You need to have Docker and Docker Compose installed on your system.

### Installation Instructions

#### Windows
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Install Docker Desktop
3. Restart your computer
4. Verify installation by running:
   ```bash
   docker --version
   docker-compose --version
   ```

#### macOS
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Install Docker Desktop
3. Verify installation by running:
   ```bash
   docker --version
   docker-compose --version
   ```

#### Linux (Ubuntu/Debian)
```bash
# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Add your user to docker group (optional, to avoid sudo)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version
```

## Starting the Hospital Backend with Docker

### Step 1: Navigate to the hospital-backend directory
```bash
cd hospital-backend
```

### Step 2: Start Docker Compose
```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL database container on port 5432
- Build and start the NestJS backend container on port 3000
- Create a Docker network for communication between containers

### Step 3: Verify the containers are running
```bash
docker-compose ps
```

You should see:
- `hospital-postgres` - PostgreSQL database (running)
- `hospital-backend` - NestJS backend (running)

### Step 4: Check the backend logs
```bash
docker-compose logs -f backend
```

You should see:
```
🚀 Hospital Backend is running on: http://localhost:3000/api
📡 WebSocket server is running on: ws://localhost:3000
```

## Connecting the Frontend

The care-connect-hub frontend is already configured to connect to the backend at `http://localhost:3000/api`.

### Environment Configuration (care-connect-hub/.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_WEBSOCKET_URL=http://localhost:3000
VITE_WEBSOCKET_AUTO_CONNECT=true
```

## Database Access

### PostgreSQL Connection Details
- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres
- **Database**: hospital_db

### Connect using psql (if installed)
```bash
psql -h localhost -U postgres -d hospital_db
```

### Connect using pgAdmin (optional)
1. Install pgAdmin: https://www.pgadmin.org/download/
2. Create a new server connection:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: postgres
   - Database: hospital_db

## Useful Docker Commands

### View logs
```bash
# Backend logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f postgres

# All logs
docker-compose logs -f
```

### Stop containers
```bash
docker-compose down
```

### Stop and remove volumes (WARNING: deletes database data)
```bash
docker-compose down -v
```

### Rebuild containers
```bash
docker-compose up -d --build
```

### Access backend container shell
```bash
docker-compose exec backend sh
```

### Access database container shell
```bash
docker-compose exec postgres psql -U postgres -d hospital_db
```

## Troubleshooting

### Port already in use
If port 3000 or 5432 is already in use, modify `docker-compose.yml`:
```yaml
ports:
  - '3001:3000'  # Change 3000 to 3001
  - '5433:5432'  # Change 5432 to 5433
```

### Database connection errors
1. Ensure PostgreSQL container is running: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Verify environment variables in `.env` file

### Backend not starting
1. Check logs: `docker-compose logs backend`
2. Ensure port 3000 is not in use
3. Rebuild containers: `docker-compose up -d --build`

## Next Steps

1. Start Docker Compose: `docker-compose up -d`
2. Verify backend is running: `curl http://localhost:3000/api`
3. Start the frontend: `npm run dev` in care-connect-hub directory
4. Access the application at `http://localhost:5173`


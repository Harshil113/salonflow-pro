#!/bin/bash
echo "🚀 SalonFlow Pro - Starting Setup..."
mkdir -p backend/src/{config,controllers,routes,middleware,services,utils,types}
mkdir -p backend/database
mkdir -p frontend/src/{components/{common,layout,pages},store/slices,services,styles}
echo "✅ Folders created!"
cat > backend/package.json << 'EOF'
{
  "name": "salonflow-backend",
  "version": "1.0.0",
  "scripts": {"dev": "nodemon src/app.js", "start": "node src/app.js"},
  "dependencies": {"express": "^4.18.2", "cors": "^2.8.5", "dotenv": "^16.0.3", "pg": "^8.11.0", "bcryptjs": "^2.4.3", "jsonwebtoken": "^9.0.0", "stripe": "^12.0.0", "socket.io": "^4.6.1"}
}
EOF
echo "✅ Backend config created!"
cat > frontend/package.json << 'EOF'
{
  "name": "salonflow-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {"dev": "vite", "build": "vite build"},
  "dependencies": {"react": "^18.2.0", "react-dom": "^18.2.0", "react-router-dom": "^6.11.0", "@reduxjs/toolkit": "^1.9.5", "axios": "^1.4.0", "framer-motion": "^10.12.16"}
}
EOF
echo "✅ Frontend config created!"
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: salonflow
    ports:
      - "5432:5432"
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
EOF
echo "🎉 Setup Script Complete!"

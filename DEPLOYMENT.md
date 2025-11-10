# W3JDev United - Deployment Guide

This guide provides instructions for deploying W3JDev United application.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Vercel Deployment (Frontend)](#vercel-deployment)
4. [Production Deployment](#production-deployment)

---

## Local Development

### Prerequisites
- Node.js 20+ (for frontend)
- PHP 8.3+ (for backend polls module)
- Docker (optional, for containerized development)

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_BASE_URL=http://localhost:5173
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## Docker Deployment

### Using Docker Compose (Recommended for Development)

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`

3. **Stop services:**
   ```bash
   docker-compose down
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Individual Docker Containers

**Frontend:**
```bash
cd frontend
docker build -t w3jdev-united-frontend .
docker run -p 5173:5173 w3jdev-united-frontend
```

---

## Vercel Deployment

### Automatic Deployment (GitHub Integration)

1. **Connect repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

2. **Configure environment variables in Vercel dashboard:**
   ```
   VITE_API_URL=https://your-api-domain.com/api/v1
   VITE_BASE_URL=https://your-domain.vercel.app
   ```

3. **Deploy:**
   - Push to main branch or trigger manual deployment from Vercel dashboard

### Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel --prod
   ```

---

## Production Deployment

### Frontend (Static Hosting)

The frontend can be deployed to any static hosting service:

#### Build Process
```bash
cd frontend
npm install
npm run build
```

The built files will be in `frontend/dist/` directory.

#### Deployment Options
- **Vercel:** (Recommended) Use the automatic GitHub integration
- **Netlify:** Connect repository and deploy
- **AWS S3 + CloudFront:** Upload dist folder to S3, configure CloudFront
- **GitHub Pages:** Use GitHub Actions to build and deploy
- **Nginx:** Serve the dist folder with nginx

#### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/w3jdev-united;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Backend (PHP Symfony - For Polls Module)

**Note:** The polls module requires a PHP backend for real-time functionality. Without it, polls work in local-only mode.

#### Requirements
- PHP 8.3+
- Composer
- SQLite or MySQL database

#### Setup (Coming Soon)
The Symfony backend implementation is planned for future releases. Currently, the application works with local storage for polls.

---

## Environment Variables

### Frontend

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api/v1` | No |
| `VITE_BASE_URL` | Frontend base URL | `http://localhost:5173` | No |
| `VITE_DEV_MODE` | Enable dev mode | `true` | No |

---

## Troubleshooting

### Build Errors

**Problem:** TypeScript compilation errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Problem:** Three.js bundle too large
- This is expected behavior due to 3D graphics library
- The warning can be safely ignored for production builds

### Runtime Issues

**Problem:** Excel import not working
- Ensure the Excel file follows the template format
- Download template from the app: Lottery > Download Template

**Problem:** Sound effects not playing
- Click anywhere on the page first (browser autoplay policy)
- Check that sound is enabled in settings

**Problem:** 3D sphere not rendering
- Ensure WebGL is supported in your browser
- Update graphics drivers
- Try a different browser (Chrome/Firefox recommended)

---

## Performance Optimization

### Frontend

1. **Enable Brotli compression:**
   ```nginx
   brotli on;
   brotli_comp_level 6;
   brotli_types text/plain text/css application/json application/javascript text/xml application/xml;
   ```

2. **Configure caching:**
   ```nginx
   location /assets {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Use CDN for static assets**

---

## Security Considerations

1. **Excel Import/Export:**
   - The xlsx library has known vulnerabilities
   - Only import files from trusted sources
   - Consider sandboxing the import process in production

2. **Polls Anti-Cheat:**
   - Voter IDs are stored in localStorage
   - For production, implement server-side validation
   - Add rate limiting to prevent spam

3. **HTTPS:**
   - Always use HTTPS in production
   - Configure SSL certificates
   - Enable HSTS headers

---

## Support

For issues and questions:
- GitHub Issues: [W3JDev/W3J-Fi/issues](https://github.com/W3JDev/W3J-Fi/issues)
- Documentation: See README.md

---

## License

MIT License - See LICENSE file for details

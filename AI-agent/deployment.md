### 🐳 Docker & Deployment
 
| # | KPI | Verification Method |
| :-- | :-- | :-- |
| 35 | `docker-compose up` builds and starts the application without errors | Run command; observe successful container startup. |
| 36 | Application is accessible at `http://localhost:8080` | Open browser to URL; login page loads. |
| 37 | Database file persists in a Docker volume/mount | Stop and restart container; previously created data remains. |
| 38 | All application features work inside the Docker container | Perform a smoke test of key features (create task, drag, log time). |
# 🗺️ Mapa de Puntos de Interés Militares

Aplicación web para gestionar y visualizar elementos militares usando Leaflet, Node.js, Express y PostGIS.

## 🚀 Inicio Rápido
<!-- ```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar base de datos
docker compose up -d
sleep 15

# 3. Crear base de datos y tablas 
docker exec -i puntos_interes_postgis psql -U postgres -c "CREATE DATABASE puntos_interes_db;"
npm run init-db

# 4. Iniciar aplicación
npm run dev
```

<!-- To initilaise the database I can also do
node scripts/init-db.js --> -->


Mapa-Puntos-Interes PostgreSQL Setup Guide
==========================================

Quick setup guide to sync [TIFDA](https://github.com/MartinezAgullo/genai-tifda/tree/main) entities with the map visualization.

* * * * *

🚀 Quick Setup (First Time Only)
--------------------------------

bash

```
# 1. Start Docker Desktop
open -a Docker
# Wait ~30 seconds for Docker to start

# 2. Start PostgreSQL container
cd /Users/pablo/Desktop/Scripts/mapa-puntos-interes
docker compose up -d

# 3. Initialize database
node scripts/init-db.js

# 4. Start mapa server
npm run dev
```

**Done!** Mapa is now running at <http://localhost:3000>

* * * * *

📋 Daily Workflow
-----------------

### Starting Everything

bash

```
# Terminal 1: Start PostgreSQL (if not running)
cd /Users/pablo/Desktop/Scripts/mapa-puntos-interes
docker compose up -d

# Terminal 2: Start mapa server
npm run dev

# Terminal 3: Start TIFDA UI
cd /Users/pablo/Desktop/Scripts/tifda
uv run python -m src.ui.gradio_interface

# Terminal 4: Run tests
uv run python tests/test_hitl_radar.py
```

### Stopping Everything

bash

```
# Stop mapa server: Ctrl+C in terminal 2

# Stop PostgreSQL:
cd /Users/pablo/Desktop/Scripts/mapa-puntos-interes
docker compose down
```



Abrir: **http://localhost:3000**

---

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL + PostGIS (Docker en puerto 5433)
- **Frontend**: HTML5 + CSS3 + Leaflet
- **Mapas**: OpenStreetMap

---

## 📋 Categorías Militares

✈️ Avion • 🛡️ Tanque • 🚁 Drone • 🏕️ BSM • 🎯 Centro de Mando  
👥 Unidad • ⚔️ Sub-Grupo Tactico • 🎖️ Peloton • 🚗 Vehiculo  
💣 Artilleria • 🪖 Infanteria • 📍 Otro

---

## 🔧 Configuración

**Archivo `.env`:**
```env
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=puntos_interes_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
```

⚠️ **Nota**: El puerto es **5433** para evitar conflictos con PostgreSQL local.

---

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/puntos` | Obtener todos los puntos |
| GET | `/api/puntos/:id` | Obtener por ID |
| GET | `/api/puntos/categoria/:cat` | Filtrar por categoría |
| GET | `/api/puntos/cerca/:lng/:lat?radio=50000` | Búsqueda espacial |
| POST | `/api/puntos` | Crear punto |
| POST | `/api/puntos/batch` | Crear múltiples |
| PUT | `/api/puntos/:id` | Actualizar |
| DELETE | `/api/puntos/:id` | Eliminar |

**Ejemplo:**
```bash
curl http://localhost:3000/api/puntos
```

---

## 📁 Estructura
```
mapa-puntos-interes/
├── config/          # Configuración BD
├── models/          # Modelos de datos
├── routes/          # Rutas API
├── public/          # Frontend
├── scripts/         # Scripts de BD
├── .env             # Variables de entorno
├── docker-compose.yml
├── package.json
└── server.js        # Servidor principal
```

---

## 🔄 Comandos Útiles
```bash
# Reiniciar todo
open -a Docker
docker compose down -v
docker compose up -d
sleep 15
docker exec -i puntos_interes_postgis psql -U postgres -c "CREATE DATABASE puntos_interes_db;"
npm run init-db
npm run dev

# Ver datos en BD
docker exec -it puntos_interes_postgis psql -U postgres -d puntos_interes_db -c "SELECT nombre, categoria FROM puntos_interes;"

# Detener
docker compose down
```

---

## 🐛 Solución de Problemas

**Error: "database does not exist"**
```bash
docker exec -i puntos_interes_postgis psql -U postgres -c "CREATE DATABASE puntos_interes_db;"
npm run init-db
```

**Error: Puerto en uso**
```bash
lsof -i :3000
# Cambiar puerto en .env
```

**Limpiar y reiniciar**
```bash
docker compose down -v
docker compose up -d
```

---

## 📝 Ejemplo JSON
```json
{
  "nombre": "Tanque T-72",
  "descripcion": "Blindado pesado",
  "categoria": "Tanque",
  "ciudad": "Madrid",
  "provincia": "Madrid",
  "elemento_identificado": "TANK-001",
  "activo": true,
  "tipo_elemento": "MBT",
  "prioridad": 9,
  "observaciones": "En movimiento",
  "latitud": 40.4168,
  "longitud": -3.7038
}
```

---

## 📄 Licencia

GNU General Public License (GPL) 3.0

---

**Desarrollado con Node.js + Express + Leaflet + PostGIS**

<!-- 
tree -I "__pycache__|__init__.py|uv.lock|README.md|docs|node_modules"
-->

# 🚀 MERN Flow — Application Full-Stack MERN

Application complète et moderne basée sur la stack **MERN** (**M**ongoDB, **E**xpress, **R**eact, **N**ode.js), avec authentification sécurisée par JWT, gestion de tâches avec tableau de bord analytique, et interface utilisateur moderne en mode sombre/clair.

---

## 📁 Structure du Projet

```text
projet stage/
├── server/                    # Backend API (Node.js, Express, MongoDB/Mongoose)
│   ├── config/                # Connexion base de données MongoDB
│   │   └── db.js
│   ├── controllers/           # Logique métier (Auth, Tâches, Statistiques)
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/            # Sécurité JWT & Gestion des erreurs
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/                # Schémas Mongoose (User, Task)
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/                # Routes API REST (/api/auth, /api/tasks)
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── .env                   # Configuration serveur & variables d'environnement
│   ├── package.json
│   └── server.js              # Point d'entrée du serveur Express
│
├── client/                    # Frontend SPA (React 19, Vite, Lucide Icons)
│   ├── src/
│   │   ├── components/        # Composants réutilisables (Navbar, TaskCard, TaskModal, ProtectedRoute)
│   │   ├── context/           # Contextes React (AuthContext, ThemeContext)
│   │   ├── pages/             # Pages (Home, Login, Register, Dashboard, NotFound)
│   │   ├── services/          # Client Axios & endpoints API (api.js)
│   │   ├── App.jsx            # Routage principal
│   │   ├── index.css          # Design System CSS moderne
│   │   └── main.jsx
│   ├── .env                   # Variables d'environnement frontend
│   ├── index.html
│   ├── package.json
│   └── vite.config.js         # Configuration Vite avec proxy backend
│
├── package.json               # Orchestrateur pour lancer Client + Serveur simultanément
├── .gitignore
└── README.md
```

---

## ⚡ Démarrage Rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- [MongoDB](https://www.mongodb.com/) (Service local démarré ou une instance [MongoDB Atlas](https://www.mongodb.com/atlas/database) dans le cloud)

### 2. Configuration des variables d'environnement
Un fichier `server/.env` est déjà préconfiguré :
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern_db
JWT_SECRET=super_secret_jwt_key_mern_app_2025_antigravity
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
> *Si vous utilisez MongoDB Atlas, remplacez `MONGO_URI` par votre chaîne de connexion Atlas.*

### 3. Lancer l'application complète en une seule commande
À la racine du projet (`projet stage`), exécutez :
```bash
npm run dev
```

Cette commande démarre :
- **Le serveur Express & MongoDB** sur : `http://localhost:5000`
- **L'application React (Vite)** sur : `http://localhost:5173`

---

## 🛠️ Commandes Disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le backend et le frontend en parallèle |
| `npm run server` | Lance uniquement le serveur backend (avec Nodemon) |
| `npm run client` | Lance uniquement le client React frontend (avec Vite) |
| `npm run install-all` | Installe toutes les dépendances (racine, backend et frontend) |

---

## 📡 Documentation des Endpoints de l'API

### 🔐 Authentification (`/api/auth`)
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `POST` | `/api/auth/register` | Inscription d'un nouvel utilisateur | Public |
| `POST` | `/api/auth/login` | Connexion et génération du token JWT | Public |
| `GET` | `/api/auth/me` | Récupère le profil de l'utilisateur connecté | Protégé (Bearer Token) |
| `PUT` | `/api/auth/me` | Met à jour les informations du profil | Protégé (Bearer Token) |

### 📋 Gestion des Tâches (`/api/tasks`)
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/api/tasks` | Liste les tâches de l'utilisateur (avec filtres & tri) | Protégé |
| `GET` | `/api/tasks/stats` | Statistiques globales (Total, À faire, En cours, Terminées) | Protégé |
| `POST` | `/api/tasks` | Création d'une nouvelle tâche | Protégé |
| `GET` | `/api/tasks/:id` | Récupère une tâche spécifique | Protégé |
| `PUT` | `/api/tasks/:id` | Modifie une tâche existante | Protégé |
| `DELETE` | `/api/tasks/:id` | Supprime une tâche | Protégé |

---

## ✨ Fonctionnalités Incluses

- 🛡️ **Authentification & Sécurité** : Chiffrement des mots de passe avec `bcryptjs`, tokens `jsonwebtoken` (JWT), routes protégées côté client et middleware côté serveur.
- 📊 **Tableau de Bord & Analytique** : Compteurs automatiques, filtres par statut et priorité, tri personnalisé.
- 🗂️ **Vues Multiples** : Bascule instantanée entre vue en **Grille de Cartes** et vue en **Colonnes Kanban**.
- 🎨 **Design System & Ergonomie** : Interface moderne (Glassmorphism, animations fluides, thèmes sombre et clair, responsive mobile/desktop).

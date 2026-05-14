from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# On crée l'application FastAPI avec un titre et une version
app = FastAPI(
    title="Inclusion Sénégal API",
    version="1.0.0",
    description="API pour la plateforme d'inclusion des personnes en situation de handicap"
)

# CORS : autorise le frontend Next.js à appeler ce backend
# Sans ça, le navigateur bloquera toutes les requêtes venant de Next.js
origins = [
    "http://localhost:3000",      # Next.js en développement local
    "https://ton-site.vercel.app" # ton domaine Vercel en production (à changer plus tard)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,   # autorise l'envoi de cookies et tokens
    allow_methods=["*"],      # GET, POST, PUT, DELETE...
    allow_headers=["*"],      # Authorization, Content-Type...
)

# Route de test : sert à vérifier que le serveur tourne
@app.get("/")
def root():
    return {"message": "API Inclusion Sénégal opérationnelle ✓"}

# Route de santé : utilisée par Railway/Render pour vérifier que l'app est vivante
@app.get("/health")
def health():
    return {"status": "ok"}

# Plus tard, on ajoutera les routers ici, comme ça :
from routers import auth, users, posts
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])

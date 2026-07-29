from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Inclusion Sénégal API",
    version="2.0.0",
    description="API pour la plateforme d'inclusion des personnes en situation de handicap",
    debug=True,
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ton-site.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "API Inclusion Sénégal opérationnelle ✓"}


@app.get("/health")
def health():
    return {"status": "ok"}


from routers import auth, users, posts, forums, podcasts, jobs, experts, temoignages, dashboard, ressources, annuaire_services, photos, stats, uploads, messaging, moderation, admin, verification

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])
app.include_router(forums.router, prefix="/api/forums", tags=["Forums"])
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])
app.include_router(messaging.router, prefix="/api", tags=["Messaging"])
app.include_router(podcasts.router, prefix="/api/podcasts", tags=["Podcasts"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(experts.router, prefix="/api/experts", tags=["Experts"])
app.include_router(temoignages.router, prefix="/api/temoignages", tags=["Témoignages"])
app.include_router(ressources.router, prefix="/api/ressources", tags=["Ressources"])
app.include_router(annuaire_services.router, prefix="/api/annuaire-services", tags=["Annuaire Services"])
app.include_router(photos.router, prefix="/api/photos", tags=["Photos"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])
app.include_router(verification.router, prefix="/api/verification", tags=["Verification"])
app.include_router(moderation.router, prefix="/api/moderation", tags=["Modération"])
app.include_router(admin.router, prefix="/api/admin", tags=["Administration"])


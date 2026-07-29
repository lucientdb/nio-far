import sys
import os
from database import SessionLocal
from models.user import User, UserRole
from core.security import hash_password

def create_admin(email: str, password: str, nom: str = "Admin", prenom: str = "Super"):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"L'utilisateur {email} existe déjà. Promotion en administrateur...")
            user.role = UserRole.admin
            user.mot_de_passe = hash_password(password)
            db.commit()
            print("Succès ! Mot de passe mis à jour et rôle admin assigné.")
        else:
            print(f"Création d'un nouvel administrateur : {email}")
            new_admin = User(
                nom=nom,
                prenom=prenom,
                email=email,
                mot_de_passe=hash_password(password),
                role=UserRole.admin,
                est_actif=True,
                email_verified=True,
            )
            db.add(new_admin)
            db.commit()
            print("Succès ! Compte admin créé.")
    except Exception as e:
        print(f"Erreur : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    create_admin(email, password)

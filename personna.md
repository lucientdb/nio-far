# Intégration Persona — Nio-Far

Guide pour activer la **certification d’identité** (document à puce NFC + selfie) une fois le partenariat Persona signé.

Aujourd’hui, le bouton **Certifier** affiche :

> Cette fonctionnalité n’est pas encore disponible. Vous serez informé une fois qu’elle l’est !

Le **vrai code Persona** est déjà dans le dépôt (plus de simulation KYC maison). Il reste à brancher les clés et à rouvrir l’UI.

---

## 1. Ce qui est déjà prêt dans le code

| Fichier | Rôle |
|---|---|
| `backend/services/persona.py` | Client API Persona (`create_inquiry`, webhook, signature) |
| `backend/routers/verification.py` | `POST /kyc/initiate`, `GET /kyc/{id}/status`, `POST /webhook/persona` |
| `frontend/services/users.ts` | `initiateKyc()`, `getKycStatus()` |
| `frontend/components/verification/IdentityVerificationModal.tsx` | Modal Hosted Flow (prêt, pas encore branché sur le profil) |

Flux cible :

1. User clique **Certifier** → Nio-Far appelle `POST /api/verification/kyc/initiate`
2. Le backend crée une **Inquiry** Persona et renvoie `hosted_url`
3. L’utilisateur scanne document + NFC + selfie **chez Persona**
4. Persona envoie un **webhook** → Nio-Far pose `is_verified = true` + badge

---

## 2. Obtenir les accès Persona

1. Créer un compte organisation : [https://withpersona.com](https://withpersona.com)
2. Docs : [https://docs.withpersona.com](https://docs.withpersona.com)
3. Dans le Dashboard :
   - Créer un **Inquiry Template** avec vérification **Government ID + NFC + Selfie / liveness**
   - Copier le **Template ID** (`itmpl_…`)
   - Créer une **API Key** sandbox (`persona_sandbox_…`)
   - Configurer un **Webhook** vers votre API (voir §4)
4. Après validation commerciale : clés **production** (`persona_production_…`)

---

## 3. Variables d’environnement (backend)

Dans `backend/.env` (jamais committer les secrets) :

```bash
# Activer Persona (obligatoire pour ouvrir le KYC)
PERSONA_ENABLED=true

# Clés fournies par Persona
PERSONA_API_KEY=persona_sandbox_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PERSONA_TEMPLATE_ID=itmpl_XXXXXXXXXXXXX
PERSONA_WEBHOOK_SECRET=whsec_ou_secret_dashboard

# Optionnel
PERSONA_API_BASE=https://withpersona.com/api/v1
PERSONA_API_VERSION=2025-10-27

# Rouvrir aussi l’OTP email pro (si souhaité)
CERTIFICATION_PUBLIC=true
```

Sans `PERSONA_ENABLED=true` + clés valides, l’API répond **503** avec le message « pas encore disponible ».

Ajoutez aussi ces lignes dans `backend/.env.example` pour l’équipe (déjà documentées ici).

---

## 4. Webhook Persona

URL à déclarer dans le dashboard Persona :

```text
https://VOTRE_DOMAINE_API/api/verification/webhook/persona
```

- Méthode : `POST`
- Header signature : `Persona-Signature` (vérifié via `PERSONA_WEBHOOK_SECRET`)
- Events utiles : `inquiry.completed`, `inquiry.failed` / `inquiry.declined`

En local (tunnel) :

```bash
ngrok http 8000
# puis webhook = https://xxxx.ngrok.io/api/verification/webhook/persona
```

---

## 5. Activer le bouton « Certifier » (frontend)

Dans `frontend/app/profil/page.tsx` :

1. Réimporter le modal :

```tsx
import IdentityVerificationModal from "@/components/verification/IdentityVerificationModal";
```

2. Remplacer l’état / le modal « pas encore disponible » par :

```tsx
const [modalCertification, setModalCertification] = useState(false);

// sur les boutons Certifier :
onClick={() => setModalCertification(true)}

// en bas du JSX :
{modalCertification && (
  <IdentityVerificationModal
    onClose={() => setModalCertification(false)}
    onSuccess={() => window.location.reload()}
  />
)}
```

3. (Optionnel) Feature flag front :

```bash
# frontend/.env.local
NEXT_PUBLIC_CERTIFICATION_ENABLED=true
```

et n’ouvrir le modal Persona que si ce flag est `true`.

---

## 6. Checklist go-live

- [ ] Compte Persona + template NFC + selfie validé en **sandbox**
- [ ] `PERSONA_ENABLED=true` + clés sandbox dans `.env`
- [ ] Webhook accessible en HTTPS + secret configuré
- [ ] Test bout en bout : initiate → Hosted Flow → webhook → badge profil
- [ ] Modal frontend branché (retirer le message « pas encore disponible »)
- [ ] `CERTIFICATION_PUBLIC=true` si vous réactivez aussi l’email pro
- [ ] Passage clés **production** + template prod
- [ ] Mentions légales / privacy : Persona traite les biométries ; Nio-Far ne stocke que le résultat

---

## 7. Sécurité & privacy (rappel LinkedIn-style)

Nio-Far **ne doit jamais** stocker :

- photo du passeport
- selfie
- numéro de document
- biométrie

Seulement : `is_verified`, `verification_type`, `verified_at`, éventuellement pays émetteur (`issuing_country` dans `meta`).

---

## 8. Dépannage

| Symptôme | Cause probable |
|---|---|
| 503 « pas encore disponible » | `PERSONA_ENABLED` false ou clés manquantes |
| 502 create_inquiry | Mauvaise API key / template / version API |
| Webhook 401 | Secret ou header `Persona-Signature` incorrect |
| Badge jamais posé | Webhook non reçu (firewall / URL) — vérifier logs backend |
| NFC échoue sur desktop | Normal : proposer mobile (Hosted Flow Persona gère souvent le QR) |

---

## 9. Contacts utiles

- Dashboard Persona : [https://app.withpersona.com](https://app.withpersona.com)
- Quickstart API : [https://docs.withpersona.com/api-quickstart-tutorial](https://docs.withpersona.com/api-quickstart-tutorial)
- Support partenaire : via votre account manager Persona après signature

Quand le partenariat est noué : remplir le `.env` (§3) → tester le webhook (§4) → brancher le modal (§5) → retirer le message « pas encore disponible ».

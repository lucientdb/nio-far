# Saisie libre de la ville - Inscription

## Vue d'ensemble
Lorsqu'un utilisateur sélectionne "Autre" dans la liste des villes, un champ de saisie libre apparaît pour lui permettre d'entrer le nom de sa ville.

## Fonctionnement

### 1. Liste des villes prédéfinies

Par défaut, l'utilisateur peut choisir parmi :
- Dakar
- Saint-Louis
- Thiès
- Ziguinchor
- Kaolack
- Mbour
- Touba
- Rufisque
- **Autre** ← Déclenche la saisie libre

### 2. Saisie libre conditionnelle

Quand "Autre" est sélectionné, un champ de texte apparaît immédiatement en dessous :

```tsx
{form.ville === "Autre" && (
  <input
    value={form.ville_autre}
    onChange={e => setField("ville_autre", e.target.value)}
    placeholder="Saisissez votre ville"
    className="..."
  />
)}
```

### 3. Champ ajouté au formulaire

```typescript
const [form, setForm] = useState({
  // ... autres champs
  ville: "",
  ville_autre: "", // ← Nouveau champ pour saisie libre
  // ... autres champs
});
```

### 4. Logique d'envoi au backend

Lors de la création du compte, la logique suivante est appliquée :

```typescript
ville: form.ville === "Autre" ? form.ville_autre : form.ville
```

**Résultat :**
- Si ville = "Dakar" → envoie "Dakar"
- Si ville = "Autre" ET ville_autre = "Tambacounda" → envoie "Tambacounda"
- Si ville = "Autre" ET ville_autre = "" → envoie "" (vide)

## Interface utilisateur

### Étape 1 : Sélection standard
```
Ville
┌──────────────────────────────┐
│ Sélectionner votre ville  ▼ │
└──────────────────────────────┘
```

### Étape 2 : Liste déroulée
```
Ville
┌──────────────────────────────┐
│ Dakar                        │
│ Saint-Louis                  │
│ Thiès                        │
│ Ziguinchor                   │
│ Kaolack                      │
│ Mbour                        │
│ Touba                        │
│ Rufisque                     │
│ Autre                        │ ← Sélection
└──────────────────────────────┘
```

### Étape 3 : Champ de saisie apparaît
```
Ville
┌──────────────────────────────┐
│ Autre                      ▼ │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Saisissez votre ville        │ ← Nouveau champ
└──────────────────────────────┘
```

## Implémentation dans les 3 sections

Cette fonctionnalité est implémentée de manière identique pour :

1. **Profil Organisation** (Entreprise, ONG, Association)
2. **Profil Expert** (Professionnels)
3. **Profil Personne** (Utilisateurs standard)

Chaque section contient le même code pour la saisie conditionnelle.

## Styles

Le champ de saisie libre :
- Apparaît avec un espacement de `mt-3` (12px)
- Utilise les mêmes classes que les autres champs de saisie
- Border-radius arrondi (`rounded-xl`)
- Focus avec bordure grise foncée
- Placeholder gris clair

## Validation

**Note importante :** Le champ `ville_autre` n'est **pas obligatoire** dans la validation du formulaire.

Si l'utilisateur sélectionne "Autre" mais ne saisit rien dans le champ libre, le backend recevra une chaîne vide pour la ville.

### Pour rendre obligatoire (optionnel) :

Si vous souhaitez rendre la saisie obligatoire quand "Autre" est sélectionné, ajoutez cette logique à la validation :

```typescript
const etape2Ok = (() => {
  // ... autres validations
  
  // Vérifier que si "Autre" est sélectionné, ville_autre est rempli
  if (form.ville === "Autre" && form.ville_autre.trim() === "") {
    return false;
  }
  
  // ... reste de la validation
})();
```

## Exemples d'utilisation

### Cas 1 : Ville prédéfinie
```
Utilisateur sélectionne : "Thiès"
→ Backend reçoit : ville = "Thiès"
```

### Cas 2 : Ville personnalisée
```
Utilisateur sélectionne : "Autre"
Utilisateur saisit : "Tambacounda"
→ Backend reçoit : ville = "Tambacounda"
```

### Cas 3 : Autre sans saisie
```
Utilisateur sélectionne : "Autre"
Utilisateur ne saisit rien
→ Backend reçoit : ville = ""
```

## Avantages

✅ **Flexibilité** : Les utilisateurs peuvent entrer n'importe quelle ville
✅ **UX fluide** : Le champ apparaît uniquement quand nécessaire
✅ **Simple** : Pas de popup ou de modale supplémentaire
✅ **Cohérent** : Même comportement sur les 3 types de profils
✅ **Accessible** : Formulaire standard avec placeholder clair

## Améliorations possibles

### 1. Auto-complétion
Ajouter une API d'auto-complétion pour suggérer des villes pendant la saisie.

### 2. Validation obligatoire
Rendre la saisie obligatoire quand "Autre" est sélectionné.

### 3. Capitalisation automatique
Formater automatiquement la première lettre en majuscule.

### 4. Liste étendue
Ajouter plus de villes sénégalaises à la liste prédéfinie.

## Fichier modifié

- `app/inscription/page.tsx`

## Statut

✅ **Terminé** - Aucune erreur TypeScript
✅ Fonctionnel sur les 3 profils
✅ Compatible backend

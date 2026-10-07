# Fusion des types Organisation (Entreprise / ONG / Association)

## Vue d'ensemble
Les types "association" et "recruteur" ont été fusionnés en un seul type "organisation" dans la page d'inscription, offrant plus de flexibilité et une meilleure expérience utilisateur.

## Changements apportés

### 1. Nouveau type unifié

**Avant :**
- 4 types de profils distincts : `"personne" | "association" | "recruteur" | "expert"`
- 2 options séparées pour les organisations

**Après :**
- 3 types de profils : `"personne" | "organisation" | "expert"`
- 1 option unique pour toutes les organisations avec sous-types

### 2. Carte de sélection

**Avant :**
```tsx
{
  key: "association",
  label: "Association ou ONG",
  desc: "Publiez des actualités, gérez votre page et vos événements.",
  icon: Heart,
},
{
  key: "recruteur",
  label: "Recruteur / Entreprise",
  desc: "Publiez des offres d'emploi adaptées et recrutez.",
  icon: Briefcase,
}
```

**Après :**
```tsx
{
  key: "organisation",
  label: "Organisation (Entreprise, ONG, Association)",
  desc: "Publiez des offres d'emploi, gérez vos événements et actualités.",
  icon: Briefcase,
}
```

### 3. Nouveau champ : Type d'organisation

Un nouveau champ `type_organisation` a été ajouté au formulaire avec 3 options :
- **Entreprise / Recruteur** → enregistré comme `"recruteur"` dans le backend
- **ONG** → enregistré comme `"association"` dans le backend
- **Association** → enregistré comme `"association"` dans le backend

### 4. Structure du formulaire

**Ajout d'un champ de sélection en premier :**
```tsx
<select value={form.type_organisation}>
  <option value="">Sélectionner le type</option>
  <option value="entreprise">Entreprise / Recruteur</option>
  <option value="ong">ONG</option>
  <option value="association">Association</option>
</select>
```

**Placeholder dynamique :**
Le champ "Nom de l'organisation" adapte son placeholder selon le type sélectionné :
- Entreprise → "Nom de l'entreprise"
- ONG → "Nom de l'ONG"
- Association → "Nom de l'association"
- Par défaut → "Nom de l'organisation"

### 5. Contact obligatoire

Le champ "Contact (téléphone)" est maintenant **obligatoire** pour les organisations (marqué avec `*`).

### 6. Validation

**Nouvelle logique de validation pour organisation :**
```typescript
if (profil === "organisation") {
  return (
    form.username.trim() !== "" &&
    form.type_organisation.trim() !== "" &&  // Nouveau champ obligatoire
    form.entreprise_nom.trim() !== "" &&
    form.contact.trim() !== "" &&
    form.email.trim() !== "" &&
    pwOk &&
    confirmOk &&
    form.cgu
  );
}
```

### 7. Mapping vers le backend

Lors de l'envoi à l'API, le type frontend est converti vers le type backend :

```typescript
profil: profil === "organisation" 
  ? (form.type_organisation === "entreprise" ? "recruteur" : "association") 
  : (profil || "personne")
```

**Logique de conversion :**
- `organisation` + `type_organisation: "entreprise"` → backend: `"recruteur"`
- `organisation` + `type_organisation: "ong"` → backend: `"association"`
- `organisation` + `type_organisation: "association"` → backend: `"association"`
- `personne` → backend: `"personne"`
- `expert` → backend: `"expert"`

## Avantages

✅ **Interface simplifiée** : 3 cartes au lieu de 4 à l'étape 1
✅ **Flexibilité** : Les organisations peuvent préciser leur type exact
✅ **Clarté** : Regroupe logiquement les entités similaires
✅ **Compatibilité backend** : Conversion transparente vers les types existants
✅ **UX améliorée** : Moins de choix initiaux, plus de précision ensuite
✅ **Évolutivité** : Facile d'ajouter de nouveaux sous-types d'organisations

## Workflow utilisateur

### Étape 1 : Choix du profil
L'utilisateur voit 3 options :
1. Utilisateur / Personne en situation de handicap
2. **Organisation (Entreprise, ONG, Association)** ← Nouveau
3. Expert ou professionnel

### Étape 2 : Détails (si Organisation sélectionnée)
1. Sélectionner le type d'organisation (Entreprise / ONG / Association)
2. Nom d'utilisateur
3. Nom de l'organisation (placeholder adapté au type)
4. Contact téléphone (obligatoire)
5. Email
6. Ville
7. Domaine d'intervention
8. Mot de passe + confirmation
9. CGU

## Impact sur le backend

**Aucun changement requis** : Le backend continue de recevoir `"recruteur"` ou `"association"` grâce à la logique de mapping dans `createAccount()`.

## État du formulaire

```typescript
const [form, setForm] = useState({
  prenom: "",
  nom: "",
  username: "",
  email: "",
  mot_de_passe: "",
  confirm: "",
  ville: "",
  type_handicap: "",
  type_organisation: "",      // ← Nouveau champ
  entreprise_nom: "",
  contact: "",
  domaine_intervention: "",
  specialite: "",
  cgu: false,
});
```

## Fichier modifié

- `app/inscription/page.tsx`

## Tests recommandés

- [ ] Sélectionner "Organisation" à l'étape 1 → doit passer à l'étape 2
- [ ] Vérifier que le champ "Type d'organisation" s'affiche en premier
- [ ] Sélectionner chaque type d'organisation et vérifier les placeholders
- [ ] Tenter de soumettre sans sélectionner de type → doit bloquer
- [ ] Vérifier que le contact est obligatoire (marqué avec *)
- [ ] Créer un compte entreprise → vérifier backend reçoit "recruteur"
- [ ] Créer un compte ONG → vérifier backend reçoit "association"
- [ ] Créer un compte association → vérifier backend reçoit "association"

## Statut

✅ **Terminé** - Aucune erreur TypeScript
✅ Compatible avec le backend existant
✅ Validation fonctionnelle

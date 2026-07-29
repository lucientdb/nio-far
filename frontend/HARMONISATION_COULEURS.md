# 🎨 Guide d'harmonisation des couleurs - Vert Émeraude

## Palette de couleurs à remplacer

### Couleurs à REMPLACER partout :
- ❌ Bleu (`blue-*`) → ✅ Émeraude (`emerald-*`)
- ❌ Violet (`violet-*` / `purple-*`) → ✅ Émeraude (`emerald-*`)
- ❌ Ambre (`amber-*`) → ✅ Émeraude (`emerald-*`)  
- ❌ Rose (`rose-*`) → ✅ Émeraude (`emerald-*`)
- ❌ Orange (`orange-*`) → ✅ Émeraude (`emerald-*`)

### Couleurs à GARDER :
- ✅ Émeraude (`emerald-*`) - Couleur principale
- ✅ Gris (`gray-*`) - Couleurs neutres
- ✅ Rouge (`red-*`) - Uniquement pour les erreurs
- ✅ Noir/Blanc - Texte et fond

## Mappings spécifiques

### Backgrounds (arrière-plans)
```
bg-blue-50   → bg-emerald-50
bg-blue-100  → bg-emerald-100
bg-blue-200  → bg-emerald-200

bg-violet-50  → bg-emerald-50
bg-violet-100 → bg-emerald-100

bg-amber-50  → bg-emerald-50
bg-amber-100 → bg-emerald-100
bg-amber-500 → bg-emerald-600
bg-amber-600 → bg-emerald-700

bg-rose-50   → bg-emerald-50
bg-rose-100  → bg-emerald-100

bg-purple-100 → bg-emerald-100
bg-orange-100 → bg-emerald-100
```

### Text colors (couleurs de texte)
```
text-blue-600  → text-emerald-600
text-blue-700  → text-emerald-700
text-blue-800  → text-emerald-800

text-violet-600 → text-emerald-600
text-violet-700 → text-emerald-700
text-violet-800 → text-emerald-800

text-amber-400  → text-emerald-500
text-amber-500  → text-emerald-600
text-amber-600  → text-emerald-700
text-amber-700  → text-emerald-700
text-amber-800  → text-emerald-800

text-rose-500   → text-emerald-500
text-rose-600   → text-emerald-600

text-purple-800 → text-emerald-800
text-orange-700 → text-emerald-700
```

### Border colors
```
border-blue-200   → border-emerald-200
border-blue-300   → border-emerald-300

border-violet-200 → border-emerald-200

border-amber-200  → border-emerald-200

border-rose-200   → border-emerald-200
```

### Fill colors (pour les SVG/icônes)
```
fill-amber-400  → fill-emerald-500
fill-amber-500  → fill-emerald-500
fill-rose-500   → fill-emerald-500
```

### Hover states
```
hover:text-rose-400  → hover:text-emerald-500
hover:text-rose-500  → hover:text-emerald-600
hover:text-violet-700 → hover:text-emerald-700
hover:bg-amber-600   → hover:bg-emerald-700
```

## Fichiers modifiés

✅ `frontend/services/forums.ts` - receiver_id type
✅ `frontend/app/services/page.tsx` - Catégories et alertes
✅ `frontend/app/inscription/page.tsx` - Liens CGU
✅ `frontend/components/Navbar.tsx` - Icônes messagerie
✅ `frontend/app/emploi/page.tsx` - Badges télétravail
✅ `frontend/app/education/page.tsx` - Badges et titres
✅ `frontend/app/profil/page.tsx` - Encadrés
✅ `frontend/app/dashboard/admin/page.tsx` - Aide
✅ `frontend/app/page.tsx` - Liens
✅ `frontend/lib/api.ts` - Timeout 30s

⏳ `frontend/app/temoignages/page.tsx` - EN COURS
⏳ `frontend/app/medias/page.tsx` - À FAIRE
⏳ `frontend/app/emploi/page.tsx` - À FAIRE (avatars)
⏳ `frontend/app/education/page.tsx` - À FAIRE (catégories)
⏳ `frontend/app/profil/page.tsx` - À FAIRE (podcasts)
⏳ `frontend/app/page.tsx` - À FAIRE (couleurs cartes)

## Actions rapides

### Rechercher toutes les couleurs non-vertes
```bash
cd frontend
grep -r "bg-blue-\|text-blue-\|border-blue-" app/
grep -r "bg-violet-\|text-violet-\|border-violet-" app/
grep -r "bg-amber-\|text-amber-\|border-amber-" app/
grep -r "bg-rose-\|text-rose-\|border-rose-" app/
grep -r "bg-purple-\|text-purple-" app/
grep -r "bg-orange-\|text-orange-" app/
```

### Replacements automatiques (PowerShell)
```powershell
# Remplacer blue par emerald
Get-ChildItem -Path "frontend/app" -Filter "*.tsx" -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace 'bg-blue-100', 'bg-emerald-100' |
    Set-Content $_.FullName
}
```

## Notes importantes

1. **Icônes et étoiles** : Les étoiles (Star) utilisées pour les notes peuvent rester en jaune/ambre pour la visibilité
2. **Erreurs** : Les messages d'erreur DOIVENT rester en rouge (red-*)
3. **Succès** : Utiliser emerald-* pour les messages de succès
4. **Neutral** : Le gris est parfait pour les états neutres/désactivés

## Validation visuelle

Après les modifications, vérifier :
- [ ] Navbar - Tout en vert/gris
- [ ] Footer - Tout en vert/gris
- [ ] Boutons principaux - Vert émeraude
- [ ] Links/hover - Vert émeraude
- [ ] Badges - Vert émeraude
- [ ] Icônes - Vert émeraude ou gris
- [ ] Alertes info - Vert émeraude (pas ambre)
- [ ] Cards/catégories - Vert émeraude


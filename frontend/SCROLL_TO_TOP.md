# Scroll to Top - Défilement automatique vers le haut

## Vue d'ensemble

Lors de la navigation entre les pages, le navigateur défile automatiquement vers le haut de la page pour offrir une meilleure expérience utilisateur.

## Fonctionnement

### Composant créé

**`components/ScrollToTop.tsx`**
- Détecte automatiquement les changements de route
- Fait défiler la page vers le haut (position 0,0) instantanément
- Ne rend aucun élément visuel
- S'exécute côté client uniquement

### Implémentation

Le composant utilise :
- `usePathname()` de Next.js pour détecter les changements de route
- `useEffect()` pour exécuter le défilement lors du changement
- `window.scrollTo(0, 0)` pour repositionner la vue en haut

```typescript
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
```

### Intégration

Le composant a été ajouté au **layout racine** (`app/layout.tsx`) pour s'appliquer à toute l'application :

```tsx
<body>
  <ScrollToTop />
  <Navbar />
  <main>{children}</main>
  <Footer />
</body>
```

## Comportement

### ✅ Cas d'utilisation

1. **Navigation depuis le footer**
   - Clic sur un lien dans le footer → La nouvelle page s'affiche depuis le haut

2. **Navigation depuis la navbar**
   - Clic sur un lien de menu → La page se charge en haut

3. **Navigation depuis le contenu**
   - Clic sur un lien dans un article, card, etc. → Retour en haut

4. **Navigation avec le bouton retour**
   - Utilisation du bouton retour du navigateur → Position en haut

### Exemple concret

**Avant :**
```
User sur page Forum (scrollé vers le bas)
  ↓ Clic sur "Services" dans le footer
Page Services s'affiche (mais scrollé vers le bas aussi) ❌
```

**Après :**
```
User sur page Forum (scrollé vers le bas)
  ↓ Clic sur "Services" dans le footer
Page Services s'affiche EN HAUT ✅
```

## Avantages

✅ **Expérience utilisateur cohérente** - Toujours voir le début de la page  
✅ **Navigation intuitive** - Comportement attendu lors du changement de page  
✅ **Automatique** - Aucune configuration nécessaire  
✅ **Performance optimisée** - Composant léger sans rendu DOM  
✅ **Compatible** - Fonctionne avec toutes les méthodes de navigation

## Personnalisation possible

Si vous voulez un défilement fluide au lieu d'instantané :

```typescript
window.scrollTo({
  top: 0,
  left: 0,
  behavior: 'smooth' // Animation douce
});
```

**Note :** L'implémentation actuelle utilise un défilement instantané pour une transition plus rapide entre les pages.

## Tests recommandés

- [ ] Cliquer sur un lien du footer depuis une page scrollée
- [ ] Naviguer entre différentes pages du menu
- [ ] Utiliser le bouton retour du navigateur
- [ ] Vérifier sur mobile et desktop
- [ ] Tester avec différents niveaux de scroll

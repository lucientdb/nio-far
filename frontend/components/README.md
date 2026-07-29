# Composants Utilitaires Nio Far

Ce dossier contient des composants réutilisables pour améliorer l'expérience utilisateur et la cohérence de l'application.

## 🔐 Authentification

### `AuthPrompt.tsx`
Affiche un message d'invitation à se connecter ou s'inscrire pour accéder à une fonctionnalité protégée.

**Utilisation :**
```tsx
import AuthPrompt from "@/components/AuthPrompt";

if (!isAuthenticated()) {
  return (
    <AuthPrompt
      title="Messagerie privée"
      message="Inscrivez-vous pour échanger en privé avec les membres."
      feature="Envoyez et recevez des messages privés."
    />
  );
}
```

### `AuthGuard.tsx`
HOC (Higher-Order Component) pour protéger une page ou section entière.

**Utilisation :**
```tsx
import AuthGuard from "@/components/AuthGuard";

export default function ProtectedPage() {
  return (
    <AuthGuard allowedRoles={["admin", "expert"]}>
      <div>Contenu protégé</div>
    </AuthGuard>
  );
}
```

## ⚠️ Gestion d'erreurs

### `ErrorDisplay.tsx`
Affiche un message d'erreur élégant avec option de réessai.

**Utilisation :**
```tsx
import ErrorDisplay from "@/components/ErrorDisplay";

if (error) {
  return (
    <ErrorDisplay
      title="Erreur de chargement"
      message={error.message}
      onRetry={() => loadData()}
      retryLabel="Réessayer"
    />
  );
}
```

### `lib/errorHandler.ts`
Utilitaires pour parser et gérer les erreurs d'API de manière cohérente.

**Utilisation :**
```tsx
import { parseApiError, getErrorMessage } from "@/lib/errorHandler";

try {
  await apiCall();
} catch (err) {
  const error = parseApiError(err);
  if (error.isTimeout) {
    // Gérer le timeout
  }
  setErrorMessage(error.message);
}
```

## 🔄 États de chargement

### `LoadingSpinner.tsx`
Spinner de chargement avec message personnalisable.

**Utilisation :**
```tsx
import LoadingSpinner from "@/components/LoadingSpinner";

if (loading) {
  return (
    <LoadingSpinner
      message="Chargement des données..."
      size="lg"
      fullScreen={true}
    />
  );
}
```

### `EmptyState.tsx`
Affiche un état vide élégant quand il n'y a pas de données.

**Utilisation :**
```tsx
import EmptyState from "@/components/EmptyState";
import { Inbox } from "lucide-react";

if (items.length === 0) {
  return (
    <EmptyState
      icon={Inbox}
      title="Aucun message"
      message="Vous n'avez pas encore de messages."
      actionLabel="Envoyer un message"
      actionHref="/messages/nouveau"
    />
  );
}
```

## 🎣 Hooks personnalisés

### `hooks/useApiCall.ts`
Hook pour simplifier les appels API avec gestion automatique du loading/error.

**Utilisation :**
```tsx
import { useApiCall } from "@/hooks/useApiCall";
import { getJobs } from "@/services/jobs";

function JobsPage() {
  const { data, loading, error, execute } = useApiCall(getJobs);

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error.message} onRetry={execute} />;
  if (!data?.length) return <EmptyState title="Aucune offre" message="..." />;

  return <div>{/* Afficher les offres */}</div>;
}
```

## 🎨 Bonnes pratiques

1. **Toujours gérer les 3 états** : loading, error, empty
2. **Utiliser les composants utilitaires** au lieu de dupliquer le code
3. **Messages d'erreur clairs** et orientés utilisateur
4. **Feedback visuel** pour toutes les actions async
5. **Timeout configuré à 30s** dans `lib/api.ts`

## 🌈 Couleurs du thème

- **Primaire** : Émeraude (`emerald-600`, `emerald-700`, `emerald-800`)
- **Succès** : Vert (`green-600`)
- **Erreur** : Rouge (`red-500`, `red-600`)
- **Warning** : Ambre (`amber-600`)
- **Info** : Bleu → Émeraude (changé pour cohérence)

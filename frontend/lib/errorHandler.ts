/**
 * Utilitaire pour gérer les erreurs d'API de manière cohérente
 */

export type ApiError = {
  message: string;
  isTimeout: boolean;
  isNetworkError: boolean;
  statusCode?: number;
};

/**
 * Parse une erreur d'API et retourne un message utilisateur-friendly
 */
export function parseApiError(error: any): ApiError {
  // Erreur de timeout
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return {
      message: "Le serveur met trop de temps à répondre. Veuillez réessayer dans quelques instants.",
      isTimeout: true,
      isNetworkError: false,
    };
  }

  // Erreur réseau (pas de connexion internet, serveur inaccessible)
  if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
    return {
      message: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
      isTimeout: false,
      isNetworkError: true,
    };
  }

  // Erreur HTTP avec code de statut
  if (error?.response) {
    const status = error.response.status;
    const detail = error.response.data?.detail;

    switch (status) {
      case 401:
        return {
          message: "Vous devez être connecté pour effectuer cette action.",
          isTimeout: false,
          isNetworkError: false,
          statusCode: 401,
        };
      case 403:
        return {
          message: detail || "Vous n'avez pas les permissions nécessaires.",
          isTimeout: false,
          isNetworkError: false,
          statusCode: 403,
        };
      case 404:
        return {
          message: detail || "Ressource introuvable.",
          isTimeout: false,
          isNetworkError: false,
          statusCode: 404,
        };
      case 422:
        return {
          message: detail || "Données invalides. Veuillez vérifier votre saisie.",
          isTimeout: false,
          isNetworkError: false,
          statusCode: 422,
        };
      case 500:
        return {
          message: "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
          isTimeout: false,
          isNetworkError: false,
          statusCode: 500,
        };
      default:
        return {
          message: detail || `Erreur ${status}: Une erreur inattendue est survenue.`,
          isTimeout: false,
          isNetworkError: false,
          statusCode: status,
        };
    }
  }

  // Erreur générique
  return {
    message: error?.message || "Une erreur inattendue est survenue. Veuillez réessayer.",
    isTimeout: false,
    isNetworkError: false,
  };
}

/**
 * Hook pour afficher un message d'erreur utilisateur-friendly
 */
export function getErrorMessage(error: any): string {
  return parseApiError(error).message;
}

/**
 * Détermine si l'erreur justifie une tentative de reconnexion automatique
 */
export function shouldRetry(error: any): boolean {
  const parsed = parseApiError(error);
  return parsed.isTimeout || parsed.isNetworkError;
}

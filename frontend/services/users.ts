import api from "@/lib/api";

export type UserProfile = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  est_actif: boolean;
  avatar_url?: string | null;
  bio?: string | null;
  type_handicap?: string | null;
  ville?: string | null;
  entreprise_nom?: string | null;
  contact?: string | null;
  domaine_intervention?: string | null;
  specialite?: string | null;
  is_verified?: boolean;
  verification_type?: string | null;
  verified_at?: string | null;
  pro_email?: string | null;
  stats?: {
    publications: number;
    likesRecus: number;
    vues: number;
  };
  cree_le?: string | null;
  username?: string | null;
};

export async function getMyProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/api/users/me");
  return data;
}

const PROFILE_UPDATE_KEYS = [
  "nom",
  "prenom",
  "username",
  "email",
  "bio",
  "type_handicap",
  "avatar_url",
  "ville",
  "entreprise_nom",
  "contact",
  "domaine_intervention",
  "specialite",
] as const;

const REQUIRED_STRING_KEYS = new Set(["nom", "prenom"]);

export async function updateMyProfile(payload: Partial<UserProfile>) {
  const body: Record<string, string | null> = {};
  for (const key of PROFILE_UPDATE_KEYS) {
    if (!(key in payload) || payload[key] === undefined) continue;
    const value = payload[key];

    if (key === "email") {
      if (typeof value === "string" && value.trim()) {
        body.email = value.trim();
      }
      continue;
    }

    if (REQUIRED_STRING_KEYS.has(key)) {
      // nom/prenom are NOT NULL in DB — never send null (empty string is ok)
      if (typeof value === "string") {
        body[key] = value.trim();
      }
      continue;
    }

    if (value === null) {
      body[key] = null;
    } else if (typeof value === "string") {
      // Empty optional strings → null (avoids unique "" collisions on username)
      body[key] = value.trim() === "" ? null : value.trim();
    }
  }
  const { data } = await api.put<UserProfile>("/api/users/me", body);
  return data;
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string; message: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/uploads/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function sendEmailOtp(email: string) {
  const { data } = await api.post("/api/verification/email-otp/send", { email });
  return data;
}

export async function verifyEmailOtp(email: string, code: string) {
  const { data } = await api.post("/api/verification/email-otp/verify", { email, code });
  return data;
}

export async function initiateKyc(): Promise<{
  session_id: string;
  inquiry_id: string;
  url: string;
  step: string;
  message?: string;
}> {
  const { data } = await api.post("/api/verification/kyc/initiate");
  return data;
}

export type KycStatus = {
  session_id: string;
  status: string;
  step: string;
  inquiry_id?: string | null;
  url?: string | null;
  issuing_country?: string | null;
  message?: string | null;
};

export async function getKycStatus(sessionId: string): Promise<KycStatus> {
  const { data } = await api.get<KycStatus>(`/api/verification/kyc/${sessionId}/status`);
  return data;
}

export async function revokeVerification() {
  const { data } = await api.delete("/api/verification/revoke");
  return data;
}

export async function changePassword(ancien: string, nouveau: string) {
  const { data } = await api.put("/api/users/me/password", {
    ancien_mot_de_passe: ancien,
    nouveau_mot_de_passe: nouveau,
  });
  return data;
}

export async function searchUsers(q: string): Promise<{id: number, nom: string, prenom: string, avatar_url?: string, role: string}[]> {
  const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(q)}`);
  return data;
}

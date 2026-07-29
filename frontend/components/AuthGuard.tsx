"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, getToken, getDashboardPath, type UserRole } from "@/lib/auth";

type Props = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export default function AuthGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    if (!token || !user) {
      router.replace("/connexion");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(getDashboardPath(user.role));
      return;
    }

    setReady(true);
  }, [router, allowedRoles]);

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500 font-semibold">Chargement...</div>
      </div>
    );
  }

  return <>{children}</>;
}

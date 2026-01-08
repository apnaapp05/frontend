"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequireAuth({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!allowedRoles.includes(payload.role)) {
         router.push('/');
         return;
      }
      setAuthorized(true);
    } catch { router.push('/auth/login'); }
  }, [allowedRoles, router]);

  return authorized ? <>{children}</> : <div className="p-10 text-center">Loading...</div>;
}

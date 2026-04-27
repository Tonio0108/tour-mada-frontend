import React, { useState, useEffect } from 'react';
import ChatInterface from "../../components/ChatInterface";
import { getAuthToken } from "../../../lib/api";

export default function ClientChat() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await getAuthToken();
      if (token) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) setUser(await res.json());
        } catch (e) { console.error(e); }
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="h-[calc(100vh-140px)] w-full">
      <ChatInterface user={user} isAdmin={false} fullScreen={true} />
    </div>
  );
}

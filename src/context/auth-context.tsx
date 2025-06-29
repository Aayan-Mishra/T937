'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is null, Firebase is not configured.
    // The component will render a helpful message instead of proceeding.
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (!auth) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
             <Alert variant="destructive" className="max-w-lg shadow-lg">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Firebase Not Configured</AlertTitle>
                <AlertDescription>
                    Your Firebase environment variables seem to be missing or invalid. Please copy the <code>.env.local.example</code> file to <code>.env.local</code> and fill in your Firebase project&apos;s credentials. You can find these in your Firebase project settings.
                </AlertDescription>
            </Alert>
        </div>
      )
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
            <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
                <div className="flex flex-col space-y-2 w-full text-center">
                    <Skeleton className="h-8 w-32 mx-auto" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                </div>
                <div className="w-full space-y-4 pt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <Skeleton className="h-10 w-full" />
            </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

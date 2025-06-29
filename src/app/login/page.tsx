'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const StaticPet = () => (
    <div className="absolute bottom-5 left-5 z-20" title="T-937's little helper!">
        <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg opacity-80">
            <g>
                <path d="M30 95C30 86.7157 36.7157 80 45 80H55C63.2843 80 70 86.7157 70 95V95H30V95Z" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="3"/>
                <rect x="38" y="85" width="24" height="5" rx="2.5" fill="hsl(var(--accent))" />
            </g>
            <g style={{transformOrigin: 'bottom center'}}>
                <circle cx="50" cy="55" r="25" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="3" />
                <circle cx="42" cy="55" r="3" fill="hsl(var(--foreground))" />
                <circle cx="58" cy="55" r="3" fill="hsl(var(--foreground))" />
                <path d="M 45 65 Q 50 72 55 65" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M49,30 L40,20" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
                <path d="M51,30 L60,20" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
            </g>
        </svg>
    </div>
);


export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: "Please check your email and password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <Card className="w-full max-w-sm bg-card border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">T937</CardTitle>
          <CardDescription>Log in to your vintage music account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      <StaticPet />
      <footer className="absolute bottom-4 text-center text-muted-foreground">
        <p>Built for the modern nostalgist.</p>
      </footer>
    </main>
  );
}

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }, [router]);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
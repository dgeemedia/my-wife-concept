// frontend/pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import '../styles/admin-dashboard.css';
import ErrorBoundary from '../components/ErrorBoundary';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Google Analytics
    const handleRouteChange = (url) => {
      if (window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

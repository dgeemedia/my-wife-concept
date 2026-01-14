// frontend/components/Layout.jsx
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      <div className="layout-wrapper">
        <Header />
        <main className="layout-main">{children}</main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
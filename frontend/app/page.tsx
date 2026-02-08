// frontend/app/page-simple.tsx.backup
// TEMPORARY SIMPLE VERSION FOR DEBUGGING
export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🎉 MyPadiFood Platform
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem' }}>
          Platform is working! Now deploying full version...
        </p>
        <div style={{ 
          background: 'white', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p><strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Loading...'}</p>
          <p><strong>Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'Loading...'}</p>
        </div>
      </div>
    </div>
  )
}
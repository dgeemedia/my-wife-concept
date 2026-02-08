// frontend/app/test/page.tsx
export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>✅ Test Page Works!</h1>
      <p>If you can see this, Next.js routing is working.</p>
      <p>Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'server'}</p>
    </div>
  )
}
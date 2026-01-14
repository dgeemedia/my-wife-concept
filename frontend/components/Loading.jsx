// frontend/components/Loading.jsx
export default function Loading({ fullScreen = false, message = 'Loading...' }) {
  if (fullScreen) {
    return (
      <div className="loading-full-screen">
        <div className="loading-spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className="loading-spinner-small"></div>
      <span className="loading-message-small">{message}</span>
    </div>
  );
}
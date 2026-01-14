// frontend/pages/admin/forgot-password.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authApi } from '../../lib/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.getSecurityQuestion(email);
      setQuestion(response.question);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Email not found or no security question set');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.recoverPassword({
        email,
        answer,
        newPassword,
      });

      if (response.ok) {
        alert('Password reset successful! Please login with your new password.');
        router.push('/admin/login');
      } else {
        setError(response.message || 'Incorrect answer');
      }
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h1 className="admin-title">🔐 Reset Password</h1>
          <p className="admin-subtitle">
            {step === 1 ? 'Enter your email to continue' : 'Answer security question'}
          </p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="admin-form">
            <div className="admin-form-group">
              <label className="admin-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="admin-input"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`admin-button ${loading ? 'home-button-disabled' : ''}`}
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {/* Step 2: Security Question & New Password */}
        {step === 2 && (
          <form onSubmit={handlePasswordReset} className="admin-form">
            <div className="admin-question-box">
              <p className="admin-question-label">Security Question:</p>
              <p className="admin-question-text">{question}</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Your Answer</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                className="admin-input"
                placeholder="Enter your answer"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="admin-input"
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="admin-input"
                placeholder="Confirm new password"
              />
            </div>

            <div className="admin-button-group">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setQuestion('');
                  setAnswer('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className="admin-back-button"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`admin-button ${loading ? 'home-button-disabled' : ''}`}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="admin-links">
          <Link href="/admin/login" className="admin-link">
            Back to Login
          </Link>
          <span className="admin-separator">•</span>
          <Link href="/" className="admin-link">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
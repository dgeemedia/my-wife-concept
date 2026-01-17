// frontend/pages/admin/first-login.js - NEW FILE
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authApi } from '../../lib/api';

// Common security questions
const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What elementary school did you attend?",
  "What city were you born in?",
  "What is your favorite book?",
  "What was your childhood nickname?",
  "What is the name of your favorite teacher?",
  "What street did you grow up on?",
  "What is your father's middle name?",
  "What was your first car's model?"
];

export default function FirstLogin() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Change password, 2: Set security
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Security question form
  const [securityForm, setSecurityForm] = useState({
    question: '',
    customQuestion: '',
    answer: '',
    confirmAnswer: '',
  });

  useEffect(() => {
    // Redirect if not authenticated
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    // Check if user actually needs to change password
    if (!user.forcePasswordChange) {
      router.push('/admin');
    }
  }, [router]);

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter';
    if (!/\d/.test(password)) return 'Include at least one number';
    if (!/[!@#$%^&*]/.test(password)) return 'Include at least one special character (!@#$%^&*)';
    return null;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      // First, change password
      const response = await authApi.changePassword({
        newPassword: passwordForm.newPassword,
        currentPassword: passwordForm.currentPassword,
      });

      if (response.ok) {
        setSuccess('✓ Password changed successfully!');
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 1500);
      } else {
        setError(response.error || 'Failed to change password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySetup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!securityForm.question && !securityForm.customQuestion) {
      setError('Please select or enter a security question');
      return;
    }

    if (!securityForm.answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    if (securityForm.answer !== securityForm.confirmAnswer) {
      setError('Answers do not match');
      return;
    }

    setLoading(true);

    try {
      const question = securityForm.customQuestion || securityForm.question;
      
      const response = await authApi.setSecurityQuestion({
        securityQuestion: question,
        securityAnswer: securityForm.answer,
      });

      if (response.ok) {
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        user.forcePasswordChange = false;
        user.hasSecurityQuestion = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        setSuccess('✓ Security question set successfully! Redirecting...');
        
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        setError(response.error || 'Failed to set security question');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*]/.test(password)) strength += 10;
    
    let label = '';
    if (strength < 50) label = 'Weak';
    else if (strength < 75) label = 'Fair';
    else if (strength < 90) label = 'Good';
    else label = 'Strong';
    
    return { strength, label };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="first-login-container">
      <div className="first-login-card">
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Change Password</span>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Security Question</span>
          </div>
        </div>

        {/* Header */}
        <div className="first-login-header">
          <h1 className="first-login-title">
            {step === 1 ? '🔐 Change Password' : '🔒 Set Security Question'}
          </h1>
          <p className="first-login-subtitle">
            {step === 1 
              ? 'Please change your temporary password to secure your account' 
              : 'Set up a security question for password recovery'}
          </p>
        </div>

        {/* Messages */}
        {error && <div className="first-login-error">{error}</div>}
        {success && <div className="first-login-success">{success}</div>}

        {/* Step 1: Password Change */}
        {step === 1 && (
          <form onSubmit={handlePasswordChange} className="first-login-form">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                className="form-input"
                placeholder="Enter temporary password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                className="form-input"
                placeholder="Enter new password"
              />
              
              {/* Password Strength Meter */}
              {passwordForm.newPassword && (
                <div className="password-strength">
                  <div className="strength-meter">
                    <div 
                      className="strength-fill" 
                      style={{ width: `${passwordStrength.strength}%` }}
                      data-strength={passwordStrength.label.toLowerCase()}
                    ></div>
                  </div>
                  <span className="strength-label">
                    Strength: {passwordStrength.label}
                  </span>
                </div>
              )}

              <ul className="password-requirements">
                <li className={passwordForm.newPassword.length >= 8 ? 'met' : ''}>
                  ✓ At least 8 characters
                </li>
                <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'met' : ''}>
                  ✓ One uppercase letter
                </li>
                <li className={/[a-z]/.test(passwordForm.newPassword) ? 'met' : ''}>
                  ✓ One lowercase letter
                </li>
                <li className={/\d/.test(passwordForm.newPassword) ? 'met' : ''}>
                  ✓ One number
                </li>
                <li className={/[!@#$%^&*]/.test(passwordForm.newPassword) ? 'met' : ''}>
                  ✓ One special character
                </li>
              </ul>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                className="form-input"
                placeholder="Re-enter new password"
              />
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="form-error">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`first-login-button ${loading ? 'disabled' : ''}`}
            >
              {loading ? 'Changing Password...' : 'Continue to Security Question'}
            </button>
          </form>
        )}

        {/* Step 2: Security Question */}
        {step === 2 && (
          <form onSubmit={handleSecuritySetup} className="first-login-form">
            <div className="form-group">
              <label className="form-label">Select Security Question</label>
              <select
                value={securityForm.question}
                onChange={(e) => {
                  setSecurityForm({
                    ...securityForm,
                    question: e.target.value,
                    customQuestion: e.target.value === 'custom' ? securityForm.customQuestion : ''
                  });
                }}
                className="form-input"
              >
                <option value="">Choose a question...</option>
                {SECURITY_QUESTIONS.map((q, i) => (
                  <option key={i} value={q}>{q}</option>
                ))}
                <option value="custom">Write my own question</option>
              </select>
            </div>

            {/* Custom Question Input */}
            {securityForm.question === 'custom' && (
              <div className="form-group">
                <label className="form-label">Your Security Question</label>
                <input
                  type="text"
                  value={securityForm.customQuestion}
                  onChange={(e) => setSecurityForm({ ...securityForm, customQuestion: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Enter your security question"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Answer</label>
              <input
                type="text"
                value={securityForm.answer}
                onChange={(e) => setSecurityForm({ ...securityForm, answer: e.target.value })}
                required
                className="form-input"
                placeholder="Enter your answer"
              />
              <p className="form-hint">
                Note: This answer is case-sensitive and will be used for password recovery.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Answer</label>
              <input
                type="text"
                value={securityForm.confirmAnswer}
                onChange={(e) => setSecurityForm({ ...securityForm, confirmAnswer: e.target.value })}
                required
                className="form-input"
                placeholder="Re-enter your answer"
              />
            </div>

            <div className="button-group">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="first-login-button secondary"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`first-login-button ${loading ? 'disabled' : ''}`}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        )}

        {/* Help Text */}
        <div className="first-login-help">
          <p>💡 <strong>Important:</strong> You must complete both steps to access the dashboard.</p>
        </div>
      </div>
    </div>
  );
}
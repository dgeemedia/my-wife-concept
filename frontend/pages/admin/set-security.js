// frontend/pages/admin/set-security.js
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
  "What was your first car's model?",
  "What is your favorite movie?",
  "What was the name of your first school?",
  "What is your favorite sports team?",
  "What is your favorite food?",
  "What is your favorite vacation spot?"
];

export default function SetSecurityQuestion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    question: '',
    customQuestion: '',
    answer: '',
    confirmAnswer: '',
  });

  useEffect(() => {
    // Redirect if not authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    // Optional: Check if user already has security question
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.hasSecurityQuestion) {
      // Optional: Show info that they already have one
      // Or redirect to change security question page
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.question && !formData.customQuestion) {
      setError('Please select or enter a security question');
      return;
    }

    if (!formData.answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    if (formData.answer !== formData.confirmAnswer) {
      setError('Answers do not match');
      return;
    }

    if (formData.answer.length < 2) {
      setError('Answer must be at least 2 characters');
      return;
    }

    setLoading(true);

    try {
      const question = formData.customQuestion || formData.question;
      
      const response = await authApi.setSecurityQuestion({
        securityQuestion: question,
        securityAnswer: formData.answer,
      });

      if (response.ok) {
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        user.hasSecurityQuestion = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        setSuccess('✓ Security question set successfully!');
        
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

  return (
    <div className="security-container">
      <div className="security-card">
        {/* Header */}
        <div className="security-header">
          <div className="security-icon">🔒</div>
          <h1 className="security-title">Set Security Question</h1>
          <p className="security-subtitle">
            This will be used to recover your password if you forget it
          </p>
        </div>

        {/* Messages */}
        {error && <div className="security-error">{error}</div>}
        {success && <div className="security-success">{success}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="security-form">
          <div className="form-group">
            <label className="form-label">Choose a Security Question</label>
            <select
              value={formData.question}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  question: e.target.value,
                  customQuestion: e.target.value === 'custom' ? formData.customQuestion : ''
                });
              }}
              className="form-input"
              required
            >
              <option value="">Select a question...</option>
              {SECURITY_QUESTIONS.map((q, i) => (
                <option key={i} value={q}>{q}</option>
              ))}
              <option value="custom">Write my own question</option>
            </select>
            <p className="form-hint">
              Choose a question only you know the answer to
            </p>
          </div>

          {/* Custom Question Input */}
          {formData.question === 'custom' && (
            <div className="form-group">
              <label className="form-label">Your Security Question</label>
              <input
                type="text"
                value={formData.customQuestion}
                onChange={(e) => setFormData({ ...formData, customQuestion: e.target.value })}
                required
                className="form-input"
                placeholder="Enter your own security question"
                maxLength={200}
              />
              <p className="form-hint">
                Maximum 200 characters. Make it memorable but not obvious.
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Your Answer</label>
            <input
              type="text"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              required
              className="form-input"
              placeholder="Enter your answer"
              maxLength={100}
            />
            <p className="form-hint">
              <strong>Important:</strong> This answer is case-sensitive and will be used for password recovery.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Answer</label>
            <input
              type="text"
              value={formData.confirmAnswer}
              onChange={(e) => setFormData({ ...formData, confirmAnswer: e.target.value })}
              required
              className="form-input"
              placeholder="Re-enter your answer"
              maxLength={100}
            />
            {formData.confirmAnswer && formData.answer !== formData.confirmAnswer && (
              <p className="form-error">✗ Answers do not match</p>
            )}
            {formData.confirmAnswer && formData.answer === formData.confirmAnswer && (
              <p className="form-success">✓ Answers match</p>
            )}
          </div>

          {/* Tips Section */}
          <div className="security-tips">
            <h3 className="tips-title">💡 Security Tips</h3>
            <ul className="tips-list">
              <li>Choose a question only you know the answer to</li>
              <li>Avoid questions with answers that can be found on social media</li>
              <li>Make your answer memorable but not obvious</li>
              <li>Consider using a phrase instead of a single word</li>
              <li>Remember: answers are case-sensitive</li>
            </ul>
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="security-button secondary"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`security-button ${loading ? 'disabled' : ''}`}
            >
              {loading ? 'Saving...' : 'Save Security Question'}
            </button>
          </div>
        </form>

        {/* Bottom Links */}
        <div className="security-links">
          <button
            onClick={() => router.push('/admin/change-password')}
            className="security-link"
          >
            Change Password Instead
          </button>
          <span className="separator">•</span>
          <button
            onClick={() => router.push('/admin')}
            className="security-link"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
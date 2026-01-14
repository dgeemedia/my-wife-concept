// frontend/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-heading">MyPadiFood</h3>
            <p className="footer-text">
              Delivering delicious local foods to your doorstep
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <p className="footer-text">Phone: +234 811 025 2143</p>
            <p className="footer-text">Email: info@mypadifood.com</p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Follow Us</h4>
            <div className="footer-social">
              <a href="https://wa.me/2348110252143" className="footer-link" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              <a href="#" className="footer-link">Instagram</a>
              <a href="#" className="footer-link">Facebook</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} MyPadiFood. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
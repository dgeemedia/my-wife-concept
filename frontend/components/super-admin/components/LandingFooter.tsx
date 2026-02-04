// frontend/components/super-admin/components/LandingFooter.tsx
import { Phone, Mail, MessageCircle, Shield } from 'lucide-react'

export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-6 h-6" />
              <span className="font-bold text-lg">MyPadiFood</span>
            </div>
            <p className="text-gray-400">
              Your trusted multi-business platform. Connecting customers with local businesses.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Businesses</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Start Your Business</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+234 811 025 2143</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@mypadifood.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Support</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2025 MyPadiFood. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
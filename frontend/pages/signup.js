// frontend/pages/signup.js

export default function BusinessSignup() {
  const [formData, setFormData] = useState({
    subdomain: '',
    businessName: '',
    businessType: 'food',
    ownerEmail: '',
    ownerPhone: '',
    whatsappNumber: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/tenant/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.ok) {
      // Redirect to their subdomain
      window.location.href = `https://${formData.subdomain}.mypadifood.com`;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Choose subdomain (e.g., mummykitchen)"
        value={formData.subdomain}
        onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
      />
      <span>.mypadifood.com</span>
      
      <input
        placeholder="Business Name"
        value={formData.businessName}
        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
      />
      
      <select
        value={formData.businessType}
        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
      >
        <option value="food">Food & Restaurant</option>
        <option value="fashion">Fashion & Boutique</option>
        <option value="electronics">Electronics</option>
        <option value="pharmacy">Pharmacy</option>
        <option value="general">General Store</option>
      </select>
      
      {/* ... other fields */}
      
      <button type="submit">Create My Store</button>
    </form>
  );
}
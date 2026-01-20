// Create this file: frontend/components/DebugInfo.js
// Add this temporarily to your cart page to debug

import { useState } from 'react';

export default function DebugInfo() {
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <button 
        onClick={() => setShow(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px',
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 9999
        }}
      >
        Debug Info
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '20px',
      background: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <button 
        onClick={() => setShow(false)}
        style={{
          float: 'right',
          background: 'red',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Close
      </button>
      
      <h3 style={{ marginTop: 0 }}>Debug Information</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Backend URL:</strong><br />
        {process.env.NEXT_PUBLIC_BACKEND_URL || 'NOT SET (using http://localhost:5000)'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>WhatsApp Number:</strong><br />
        {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'NOT SET'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Window defined:</strong><br />
        {typeof window !== 'undefined' ? 'Yes' : 'No'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>LocalStorage available:</strong><br />
        {typeof window !== 'undefined' && window.localStorage ? 'Yes' : 'No'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Test API Call:</strong><br />
        <button 
          onClick={async () => {
            try {
              const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
              const response = await fetch(`${url}/health`);
              const data = await response.json();
              alert('API is working!\n\n' + JSON.stringify(data, null, 2));
            } catch (error) {
              alert('API Error:\n\n' + error.message);
            }
          }}
          style={{
            marginTop: '5px',
            padding: '5px 10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            marginRight: '5px'
          }}
        >
          Test Backend Connection
        </button>
        
        <button 
          onClick={async () => {
            try {
              const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
              
              // Test with minimal data
              const testPayload = {
                customerName: 'Test Customer',
                phone: '1234567890',
                address: 'Test Address',
                email: 'test@test.com',
                message: 'Test message',
                items: [
                  {
                    productId: 1,
                    quantity: 1,
                    price: 100
                  }
                ]
              };
              
              console.log('Sending test checkout:', testPayload);
              
              const response = await fetch(`${url}/api/orders/checkout`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(testPayload)
              });
              
              console.log('Response status:', response.status);
              
              const data = await response.json();
              console.log('Response data:', data);
              
              if (response.ok) {
                alert('Checkout endpoint works!\n\n' + JSON.stringify(data, null, 2));
              } else {
                alert('Checkout failed!\n\nStatus: ' + response.status + '\n\n' + JSON.stringify(data, null, 2));
              }
            } catch (error) {
              alert('Checkout test error:\n\n' + error.message + '\n\nCheck console for details');
              console.error('Full error:', error);
            }
          }}
          style={{
            marginTop: '5px',
            padding: '5px 10px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Test Checkout Endpoint
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>All Env Variables:</strong><br />
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '3px',
          overflow: 'auto'
        }}>
          {JSON.stringify({
            NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
            NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
            NODE_ENV: process.env.NODE_ENV,
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
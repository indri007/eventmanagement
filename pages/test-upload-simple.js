import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function TestUploadSimple() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      setUser(JSON.parse(userData));
      loadTransactions();
    }
  }, []);

  const loadTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const testUpload = async () => {
    if (!selectedTransaction) {
      alert('Please select a transaction first');
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const token = localStorage.getItem('token');
      
      // Test with a simple 1x1 pixel PNG in Base64
      const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const uploadData = {
        fileData: testBase64,
        fileName: 'test-proof.png',
        fileType: 'image/png'
      };

      console.log('Testing upload for transaction:', selectedTransaction);

      const response = await fetch(`/api/transactions/${selectedTransaction}/upload-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(uploadData)
      });

      const result = await response.json();
      
      setTestResult({
        success: response.ok,
        status: response.status,
        data: result,
        uploadData: {
          base64Length: testBase64.length,
          fileName: uploadData.fileName,
          fileType: uploadData.fileType
        }
      });

      if (response.ok) {
        loadTransactions(); // Reload to see updated status
      }

    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestTransaction = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: 1, // Assuming event ID 1 exists
          quantity: 1,
          pointsUsed: 0
        })
      });

      if (response.ok) {
        alert('Test transaction created!');
        loadTransactions();
      } else {
        const result = await response.json();
        alert('Failed to create transaction: ' + result.message);
      }
    } catch (error) {
      alert('Error creating transaction: ' + error.message);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Test Upload Simple</h1>
        <p>Please login first.</p>
        <a href="/auth/login">Login</a>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Test Upload Simple - EventKu</title>
      </Head>

      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Test Upload Simple</h1>
        <p>User: {user.name} ({user.email})</p>

        <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Step 1: Create Test Transaction</h3>
          <button 
            onClick={createTestTransaction}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create Test Transaction
          </button>
        </div>

        <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Step 2: Select Transaction</h3>
          <select 
            value={selectedTransaction}
            onChange={(e) => setSelectedTransaction(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
          >
            <option value="">Select a transaction...</option>
            {transactions
              .filter(t => t.status === 'WAITING_PAYMENT')
              .map(transaction => (
                <option key={transaction.id} value={transaction.id}>
                  Transaction #{transaction.id} - {transaction.event?.title} - {transaction.status}
                </option>
              ))}
          </select>

          <h4>All Transactions:</h4>
          <ul>
            {transactions.map(t => (
              <li key={t.id}>
                #{t.id} - {t.event?.title} - Status: {t.status} - 
                Amount: Rp {t.finalPrice?.toLocaleString('id-ID')}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Step 3: Test Upload</h3>
          <button 
            onClick={testUpload}
            disabled={!selectedTransaction || loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Testing Upload...' : 'Test Base64 Upload'}
          </button>
        </div>

        {testResult && (
          <div style={{ 
            margin: '2rem 0', 
            padding: '1rem', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: testResult.success ? '#d4edda' : '#f8d7da'
          }}>
            <h3>Test Result</h3>
            <p><strong>Success:</strong> {testResult.success ? 'Yes' : 'No'}</p>
            <p><strong>Status:</strong> {testResult.status}</p>
            
            {testResult.uploadData && (
              <div>
                <h4>Upload Data:</h4>
                <ul>
                  <li>File Name: {testResult.uploadData.fileName}</li>
                  <li>File Type: {testResult.uploadData.fileType}</li>
                  <li>Base64 Length: {testResult.uploadData.base64Length} characters</li>
                </ul>
              </div>
            )}

            <h4>API Response:</h4>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.9rem'
            }}>
              {JSON.stringify(testResult.data || testResult.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
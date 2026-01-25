import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function DebugTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      setUser(JSON.parse(userData));
      loadTransactions();
    } else {
      setLoading(false);
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

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Debug Transactions</h1>
        <p>Please login first to see transactions.</p>
        <a href="/auth/login">Login</a>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Debug Transactions - EventKu</title>
      </Head>

      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1>Debug Transactions</h1>
        <p>User: {user.name} ({user.email})</p>
        
        <button 
          onClick={createTestTransaction}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '1rem 0'
          }}
        >
          Create Test Transaction
        </button>

        <h2>Your Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Event</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Amount</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Created</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{transaction.id}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                    {transaction.event?.title || 'Unknown Event'}
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: 
                        transaction.status === 'DONE' ? '#d4edda' :
                        transaction.status === 'WAITING_PAYMENT' ? '#fff3cd' :
                        transaction.status === 'WAITING_CONFIRMATION' ? '#cce5ff' :
                        transaction.status === 'REJECTED' ? '#f8d7da' : '#e2e3e5'
                    }}>
                      {transaction.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                    Rp {transaction.finalPrice?.toLocaleString('id-ID') || '0'}
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                    {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                    <a 
                      href={`/transactions/${transaction.id}`}
                      style={{
                        padding: '0.3rem 0.6rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Debug Info</h3>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>User Role:</strong> {user.role}</p>
          <p><strong>Total Transactions:</strong> {transactions.length}</p>
          <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
        </div>
      </div>
    </>
  );
}
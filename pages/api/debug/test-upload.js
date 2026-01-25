import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('=== DEBUG TEST UPLOAD ===');
    console.log('Request body:', req.body);
    console.log('Headers:', req.headers);

    // Test database connection
    const testConnection = await prisma.user.findFirst();
    console.log('Database connection test:', testConnection ? 'OK' : 'FAILED');

    // Test JWT
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('JWT decode success:', decoded);
    } catch (jwtError) {
      console.log('JWT decode error:', jwtError.message);
      return res.status(401).json({ message: 'Token tidak valid' });
    }

    // Test transaction lookup
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID required' });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(transactionId) }
    });

    console.log('Transaction found:', transaction);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Test Base64 data simulation
    const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // 1x1 pixel PNG
    
    try {
      const updateResult = await prisma.transaction.update({
        where: { id: parseInt(transactionId) },
        data: {
          paymentProof: 'test-proof.png',
          paymentProofData: testBase64,
          paymentProofType: 'image/png',
          status: 'WAITING_CONFIRMATION'
        }
      });
      
      console.log('Update result:', updateResult);
      
      res.status(200).json({
        success: true,
        message: 'Test upload successful',
        data: {
          transactionId: transactionId,
          originalTransaction: transaction,
          updatedTransaction: updateResult,
          testBase64Length: testBase64.length
        }
      });
      
    } catch (updateError) {
      console.error('Update error:', updateError);
      res.status(500).json({ 
        message: 'Database update failed', 
        error: updateError.message 
      });
    }

  } catch (error) {
    console.error('Debug test error:', error);
    res.status(500).json({ 
      message: 'Test failed', 
      error: error.message,
      stack: error.stack
    });
  }
}
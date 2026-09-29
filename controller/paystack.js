const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Verifies a Paystack transaction server-side using the secret key, which
// never leaves this process. The frontend only ever holds the public key.
async function verifyTransaction(req, res) {
  const { reference, expectedAmount } = req.body || {};

  if (!reference || typeof reference !== 'string') {
    return res.status(400).json({ verified: false, message: 'Missing transaction reference' });
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    const payload = await paystackRes.json();

    if (!paystackRes.ok || !payload.status) {
      return res.status(400).json({ verified: false, message: payload.message || 'Verification failed' });
    }

    const tx = payload.data;
    const amountMatches = expectedAmount == null || tx.amount === expectedAmount;
    const verified = tx.status === 'success' && amountMatches;

    if (!verified) {
      return res.status(200).json({
        verified: false,
        message: tx.status !== 'success' ? `Transaction status: ${tx.status}` : 'Amount mismatch',
      });
    }

    return res.json({
      verified: true,
      reference: tx.reference,
      amount: tx.amount,
      currency: tx.currency,
      channel: tx.channel,
      paidAt: tx.paid_at,
    });
  } catch (err) {
    console.error('Paystack verify error:', err.message);
    return res.status(502).json({ verified: false, message: 'Could not reach Paystack' });
  }
}

module.exports = { verifyTransaction };

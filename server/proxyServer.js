const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/create-invoice', async (req, res) => {
  try {
    const response = await fetch('https://www.zohoapis.com/invoice/v3/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Zoho-oauthtoken 1000.6f313765c4cabf40f8ed4ece55e56810.ef2656371685eb195ca7b9ae275381bb', // Replace with your access token
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create invoice:', errorText);
      throw new Error('Failed to create invoice');
    }

    const result = await response.json();
    console.log('Invoice created successfully:', result);
    
    // Generate PDF using Zoho API
    const pdfResponse = await fetch(`https://www.zohoapis.com/invoice/v3/invoices/${result.invoice.invoice_id}?accept=pdf`, {
      method: 'GET',
      headers: {
        'Authorization': 'Zoho-oauthtoken 1000.6f313765c4cabf40f8ed4ece55e56810.ef2656371685eb195ca7b9ae275381bb', // Replace with your access token
      },
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error('Failed to generate PDF:', errorText);
      throw new Error('Failed to generate PDF');
    }

    const pdfBuffer = await pdfResponse.buffer();
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Proxy server is running on http://localhost:3001');
});

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json({limit:'10mb'}));
app.use(express.static(path.join(__dirname)));

app.post('/api/analyze', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    if (data.content && data.content[0]) {
      const text = data.content[0].text;
      const clean = text.replace(/[\u2018\u2019\u201C\u201D]/g, '"').replace(/```json|```/g,'').trim();
      data.content[0].text = clean;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

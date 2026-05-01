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
    const raw = data.content && data.content[0] ? data.content[0].text : '';
    const clean = raw.replace(/```json|```/g,'').trim();
    try {
      const parsed = JSON.parse(clean);
      res.json({content:[{text: JSON.stringify(parsed)}]});
    } catch(e) {
      res.json({content:[{text: clean}], parseError: e.message});
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

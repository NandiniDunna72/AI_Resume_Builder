import express from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Get all summaries for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const results = await pool.query(
      'SELECT * FROM summary_history WHERE user_email = $1 ORDER BY date DESC', 
      [req.user.email]
    );
    res.json(results.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save Summary Result
router.post('/', authMiddleware, async (req, res) => {
  const { id, url, language, text, date } = req.body;
  
  if (!id) return res.status(400).json({ error: 'ID (UNIX timestamp) is required' });

  try {
    await pool.query(
      `INSERT INTO summary_history (id, user_email, url, language, text, date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (id) 
       DO UPDATE SET 
         url = EXCLUDED.url, 
         language = EXCLUDED.language, 
         text = EXCLUDED.text, 
         date = EXCLUDED.date`,
      [id, req.user.email, url, language, text, date]
    );

    res.json({ id, message: 'Summary result saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Summary Result
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM summary_history WHERE id = $1 AND user_email = $2', 
      [req.params.id, req.user.email]
    );
    res.json({ message: 'Summary result deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

// Generate Summary
router.post('/generate', async (req, res) => {
  const { text, language } = req.body;
  
  if (!text || !language) {
    return res.status(400).json({ error: 'Text and language are required' });
  }

  try {
    // Generate a local summary without using any external API
    // Split the text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Extract the first few sentences as a summary (e.g., up to 5 sentences or 20% of the text)
    const numSentences = Math.max(2, Math.ceil(sentences.length * 0.15));
    const summarySentences = sentences.slice(0, Math.min(numSentences, 5)).join(' ').trim();

    let generatedText = `**Local Extractive Summary (No API)**\n\n`;
    generatedText += `### 1. Summary\n${summarySentences || text.substring(0, 500) + '...'}\n\n`;
    generatedText += `### 2. Key Concepts\n- Local extraction\n- Text processing\n\n`;
    generatedText += `### 3. Deadlines\nNo deadlines detected in local analysis.\n\n`;
    generatedText += `### 4. Owners/Speakers\nNot identified locally.`;

    if (language !== 'English') {
      generatedText += `\n\n*(Note: Translation to ${language} is not available in local mode. Please use an English summary or enable the AI API for translation.)*`;
    }

    res.json({ summary: generatedText });
  } catch (err) {
    console.error("Generate summary error:", err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

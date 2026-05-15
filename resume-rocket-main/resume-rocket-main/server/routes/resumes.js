import express from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all resumes for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await pool.query(
      'SELECT * FROM resume_history WHERE user_email = $1 ORDER BY updated_at DESC', 
      [req.user.email]
    );
    res.json(resumes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific resume with all details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resumeRes = await pool.query(
      'SELECT * FROM resume_history WHERE id = $1 AND user_email = $2', 
      [req.params.id, req.user.email]
    );
    if (resumeRes.rows.length === 0) return res.status(404).json({ error: 'Resume not found' });

    const resume = resumeRes.rows[0];
    res.json({
      ...resume,
      ...resume.data // Spread the nested json object fields
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or Update Resume
router.post('/', authMiddleware, async (req, res) => {
  const { id, title, date, ...data } = req.body;
  
  if (!id) return res.status(400).json({ error: 'ID (UNIX timestamp) is required' });

  try {
    // We use id as primary key (UNIX timestamp from client)
    await pool.query(
      `INSERT INTO resume_history (id, user_email, title, date, data) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (id) 
       DO UPDATE SET 
         title = EXCLUDED.title, 
         date = EXCLUDED.date, 
         data = EXCLUDED.data, 
         updated_at = CURRENT_TIMESTAMP`,
      [id, req.user.email, title, date, JSON.stringify(data)]
    );

    res.json({ id, message: 'Resume saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Resume
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM resume_history WHERE id = $1 AND user_email = $2', 
      [req.params.id, req.user.email]
    );
    res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

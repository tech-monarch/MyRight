import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()

// POST /api/chats — save or update a chat session
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { messages, category, urgency, caseId, sessionId } = req.body

  try {
    if (sessionId) {
      // Update existing session
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          messages,
          category,
          urgency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', req.user.id)
        .select()
        .single()

      if (error) throw error
      res.json({ session: data })
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id:  req.user.id,
          case_id:  caseId || null,
          messages,
          category: category || 'Other',
          urgency:  urgency  || 'low',
        })
        .select()
        .single()

      if (error) throw error
      res.json({ session: data })
    }
  } catch (error: any) {
    console.error('Chat session error:', error)
    res.status(500).json({ error: 'Failed to save chat session' })
  }
})

// GET /api/chats — get all chat sessions for user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    res.json({ sessions: data })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch chat sessions' })
  }
})

// GET /api/chats/:id — get single session
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single()

    if (error) throw error
    res.json({ session: data })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch session' })
  }
})

// DELETE /api/chats/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

export default router
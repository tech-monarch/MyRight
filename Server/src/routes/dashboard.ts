import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    // Count all mediation requests for this user
    const { count: total, error: totalError } = await supabase
      .from('mediation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (totalError) throw totalError;

    // Count active mediations (status = 'pending' or 'invited')
    const { count: active, error: activeError } = await supabase
      .from('mediation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'invited']);

    if (activeError) throw activeError;

    // Count resolved cases (status = 'resolved')
    const { count: resolved, error: resolvedError } = await supabase
      .from('mediation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'resolved');

    if (resolvedError) throw resolvedError;

    res.json({
      totalDisputes: total || 0,
      activeMediations: active || 0,
      resolvedCases: resolved || 0,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/dashboard/disputes
router.get('/disputes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('mediation_requests')
      .select('id, description, category, opponent_name, opponent_email, opponent_phone, opponent_organization, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const disputes = data.map((item) => ({
      id: item.id,
      title: item.description.substring(0, 60) + (item.description.length > 60 ? '…' : ''),
      category: item.category,
      status: item.status, // raw: 'pending', 'invited', 'in_mediation', 'resolved'
      dateInitiated: new Date(item.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      opponentName: item.opponent_name,
      opponentEmail: item.opponent_email,
      opponentPhone: item.opponent_phone,
      opponentOrganization: item.opponent_organization,
    }));

    res.json({ disputes });
  } catch (error) {
    console.error('Disputes error:', error);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});


// PATCH /api/dashboard/disputes/:id – update status or other fields
router.patch('/disputes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, category, opponent_name, opponent_email, opponent_phone, opponent_organization } = req.body;
  const userId = req.user.id;

  // First verify ownership
  const { data: existing, error: findErr } = await supabase
    .from('mediation_requests')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (findErr || !existing) {
    res.status(404).json({ error: 'Dispute not found or not owned by you' });
    return;
  }

  const updates: Record<string, any> = {};
  if (status) updates.status = status;
  if (category) updates.category = category;
  if (opponent_name) updates.opponent_name = opponent_name;
  if (opponent_email) updates.opponent_email = opponent_email;
  if (opponent_phone) updates.opponent_phone = opponent_phone;
  if (opponent_organization) updates.opponent_organization = opponent_organization;

  const { error: updateErr } = await supabase
    .from('mediation_requests')
    .update(updates)
    .eq('id', id);

  if (updateErr) {
    console.error(updateErr);
    res.status(500).json({ error: 'Failed to update dispute' });
    return;
  }

  res.json({ success: true });
});

// DELETE /api/dashboard/disputes/:id – soft delete (set status = 'deleted') or hard delete
router.delete('/disputes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Verify ownership
  const { data: existing, error: findErr } = await supabase
    .from('mediation_requests')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (findErr || !existing) {
    res.status(404).json({ error: 'Dispute not found or not owned by you' });
    return;
  }

  // Hard delete (or you can set status = 'deleted')
  const { error: deleteErr } = await supabase
    .from('mediation_requests')
    .delete()
    .eq('id', id);

  if (deleteErr) {
    console.error(deleteErr);
    res.status(500).json({ error: 'Failed to delete dispute' });
    return;
  }

  res.json({ success: true });
});

// Helper to map DB status to display status
function mapStatus(dbStatus: string): 'In Mediation' | 'AI Assessment' | 'Invited Party' | 'Resolved' {
  switch (dbStatus) {
    case 'pending': return 'AI Assessment';
    case 'invited': return 'Invited Party';
    case 'in_mediation': return 'In Mediation';
    case 'resolved': return 'Resolved';
    default: return 'AI Assessment';
  }
}

// GET /api/dashboard/disputes/:id
router.get('/disputes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('mediation_requests')
      .select('id, description, category, opponent_name, opponent_email, opponent_phone, opponent_organization, status, created_at')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ dispute: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dispute' });
  }
});

export default router;
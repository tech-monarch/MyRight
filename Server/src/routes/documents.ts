import { Router, Response } from 'express'
import multer from 'multer'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router  = Router()
const storage = multer.memoryStorage()
const upload  = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, JPG and PNG files are allowed'))
    }
  }
})

// POST /api/documents/upload
router.post('/upload', requireAuth, upload.array('files', 5), async (req: AuthRequest, res: Response) => {
  const files      = req.files as Express.Multer.File[]
  const { caseId } = req.body

  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' })
    return
  }

  try {
    const uploaded = []

    for (const file of files) {
      const filePath = `${req.user.id}/${caseId || 'pending'}/${Date.now()}-${file.originalname}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file.buffer, { contentType: file.mimetype })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
          case_id: caseId || null,
          user_id: req.user.id,       // FIX: was missing before
          name:    file.originalname,
          type:    file.mimetype,
          size:    file.size,
          url:     publicUrl,
        })
        .select()
        .single()

      if (dbError) throw dbError
      uploaded.push(data)
    }

    res.json({ success: true, documents: uploaded })

  } catch (error: any) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// GET /api/documents/:caseId
router.get('/:caseId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { caseId } = req.params

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', req.user.id)     // FIX: scope to current user
      .order('uploaded_at', { ascending: false })

    if (error) throw error

    res.json({ documents: data })

  } catch (error: any) {
    console.error('Fetch documents error:', error)
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

export default router
import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse form data
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    })

    const [fields, files] = await form.parse(req)
    
    const resumeFile = files.resume?.[0]

    if (!resumeFile) {
      return res.status(400).json({ error: 'No resume file provided' })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(resumeFile.mimetype || '')) {
      return res.status(400).json({ 
        error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.' 
      })
    }

    // Read file content
    const fileContent = fs.readFileSync(resumeFile.filepath)
    
    // Send to backend for parsing
    const backendFormData = new FormData()
    backendFormData.append('resume', new Blob([fileContent], { type: resumeFile.mimetype }), resumeFile.originalFilename || 'resume')

    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/parse-resume`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!backendResponse.ok) {
      throw new Error('Backend resume parsing failed')
    }

    const parsedData = await backendResponse.json()

    // Clean up temporary file
    fs.unlinkSync(resumeFile.filepath)

    // Return parsed resume data
    res.status(200).json({
      success: true,
      parsedResume: parsedData,
      fileName: resumeFile.originalFilename,
      fileSize: resumeFile.size,
    })

  } catch (error) {
    console.error('Resume upload error:', error)
    res.status(500).json({ 
      error: 'Failed to process resume. Please try again.' 
    })
  }
}

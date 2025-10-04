import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { interviewResults, parsedResume, parsedJobDescription } = req.body

    if (!interviewResults) {
      return res.status(400).json({ error: 'Interview results required' })
    }

    const client = await clientPromise
    const db = client.db('interviewbot')
    const usersCollection = db.collection('users')

    // Create interview record
    const interviewRecord = {
      id: new ObjectId().toString(),
      date: new Date().toISOString(),
      jobTitle: parsedJobDescription?.title || 'Unknown Position',
      company: parsedJobDescription?.company || 'Unknown Company',
      location: parsedJobDescription?.location || '',
      country: parsedJobDescription?.country || '',
      employmentType: parsedJobDescription?.employment_type || '',
      overallScore: interviewResults.overallScore,
      completed: true,
      results: interviewResults,
      parsedResume: parsedResume,
      parsedJobDescription: parsedJobDescription,
      createdAt: new Date(),
    }

    // Add to user's interview history
    await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $push: { 
          interviewHistory: interviewRecord
        }
      }
    )

    res.status(200).json({
      success: true,
      interviewId: interviewRecord.id
    })

  } catch (error) {
    console.error('Save interview error:', error)
    res.status(500).json({ error: 'Failed to save interview' })
  }
}


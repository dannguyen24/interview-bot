import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { interviewId } = req.query

    if (!interviewId || typeof interviewId !== 'string') {
      return res.status(400).json({ error: 'Interview ID required' })
    }

    const client = await clientPromise
    const db = client.db('interviewbot')
    const usersCollection = db.collection('users')

    // Get user with specific interview
    const user = await usersCollection.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { interviewHistory: 1 } }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Find specific interview in history
    const interview = user.interviewHistory?.find((int: any) => int.id === interviewId)

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' })
    }

    res.status(200).json({
      success: true,
      interview: interview
    })

  } catch (error) {
    console.error('Get interview error:', error)
    res.status(500).json({ error: 'Failed to load interview' })
  }
}


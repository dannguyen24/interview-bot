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

    const client = await clientPromise
    const db = client.db('interviewbot')
    const usersCollection = db.collection('users')

    // Get user with interview history
    const user = await usersCollection.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { interviewHistory: 1 } }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const interviewHistory = user.interviewHistory || []

    // Return interview history (sorted by date, newest first)
    const sortedHistory = interviewHistory.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    res.status(200).json({
      success: true,
      interviews: sortedHistory
    })

  } catch (error) {
    console.error('Get interviews error:', error)
    res.status(500).json({ error: 'Failed to load interviews' })
  }
}


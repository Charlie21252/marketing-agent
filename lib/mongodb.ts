import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined
}

const cached = global._mongoose ?? (global._mongoose = { conn: null, promise: null })

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable is not set')

  if (cached.conn) return cached.conn
  if (!cached.promise) {
    // Separate database from LeadFlow so the two apps' leads never mix.
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || 'adam-agent',
    })
  }
  try {
    cached.conn = await cached.promise
  } catch (err) {
    // Don't cache a failed attempt — retry on the next request.
    cached.promise = null
    throw err
  }
  return cached.conn
}

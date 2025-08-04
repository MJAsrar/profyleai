import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Simple database query with timeout
    const startTime = Date.now()
    
    // Test basic connection
    await prisma.$connect()
    console.log('Prisma connected successfully')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`Database query completed in ${duration}ms`)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database connection failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}
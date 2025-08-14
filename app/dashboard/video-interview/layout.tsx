import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Interview Practice | Profyle AI',
  description: 'Practice video interviews with AI-powered feedback and real-time analysis',
}

export default function VideoInterviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

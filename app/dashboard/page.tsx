import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { PageContainer } from "@/components/ui/page-container"
import { MotionWrapper } from "@/components/ui/motion-wrapper"

export default function DashboardPage() {
  return (
    <PageContainer maxWidth="7xl" padding="lg" className="min-h-screen">
      <div className="space-y-8">
        <MotionWrapper animation="fade-in-down">
          <DashboardHeader />
        </MotionWrapper>
        <MotionWrapper animation="fade-in-up" delay={200}>
          <DashboardOverview />
        </MotionWrapper>
      </div>
    </PageContainer>
  )
}

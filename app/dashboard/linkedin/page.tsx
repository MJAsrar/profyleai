import { LinkedInHeader } from "@/components/linkedin/linkedin-header"
import { LinkedInOptimizer } from "@/components/linkedin/linkedin-optimizer"

export default function LinkedInPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <LinkedInHeader />
      <LinkedInOptimizer />
    </div>
  )
}

import { generateMetadata, resumeFAQSchema, resumeBuildingHowToSchema } from "@/lib/seo-config"

export const metadata = generateMetadata('templates')

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(resumeFAQSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(resumeBuildingHowToSchema),
        }}
      />
      {children}
    </>
  )
}
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import CategoryNavigation from '@/components/CategoryNavigation'

export default function BusinessProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      <CategoryNavigation />
      {children}
    </div>
  )
}

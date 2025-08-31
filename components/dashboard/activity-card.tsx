import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ActivityItem {
  id: string
  title: string
  subtitle: string
  value: string
  timestamp: string
  icon?: React.ReactNode
}

interface ActivityCardProps {
  title: string
  items: ActivityItem[]
  renderItem?: (item: ActivityItem) => React.ReactNode
}

export function ActivityCard({ title, items, renderItem }: ActivityCardProps) {
  const defaultRenderItem = (item: ActivityItem) => (
    <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        {item.icon && (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            {item.icon}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          <p className="text-sm text-gray-500">{item.subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">{item.value}</p>
        <p className="text-sm text-gray-500">{item.timestamp}</p>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map(renderItem || defaultRenderItem)}
        </div>
      </CardContent>
    </Card>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatusItem {
  status: string
  count: number
  color: string
}

interface StatusCardProps {
  title: string
  items: StatusItem[]
}

export function StatusCard({ title, items }: StatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.status} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${item.color}`}>
                  {item.status}
                </div>
              </div>
              <span className="font-semibold text-gray-900">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
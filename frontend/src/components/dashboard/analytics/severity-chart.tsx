import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface SeverityData {
  severity: string
  count: number
  color: string
}

interface SeverityChartProps {
  data: {
    LOW: number
    MEDIUM: number
    HIGH: number
    CRITICAL: number
  }
}

export function SeverityChart({ data }: SeverityChartProps) {
  const chartData: SeverityData[] = [
    {
      severity: 'Critical',
      count: data.CRITICAL,
      color: '#dc2626', // red-600
    },
    {
      severity: 'High',
      count: data.HIGH,
      color: '#ea580c', // orange-600
    },
    {
      severity: 'Medium',
      count: data.MEDIUM,
      color: '#ca8a04', // yellow-600
    },
    {
      severity: 'Low',
      count: data.LOW,
      color: '#16a34a', // green-600
    },
  ]

  const total = chartData.reduce((sum, item) => sum + item.count, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : '0'
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.severity} Severity</p>
          <p className="text-sm text-muted-foreground">
            {data.count} CVEs ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.value} ({entry.payload.count})
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CVE Severity Distribution</CardTitle>
        <CardDescription>
          Breakdown of vulnerabilities by severity level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {total === 0 && (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No CVE data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
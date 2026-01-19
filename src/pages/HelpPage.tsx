import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui'
import { ArrowLeft, HelpCircle, ChevronRight } from 'lucide-react'

const popularTopics = [
  {
    id: '1',
    topic: 'Managing your account',
  },
  {
    id: '2',
    topic: 'Using social media',
  },
  {
    id: '3',
    topic: 'Managing your account',
  },
  {
    id: '4',
    topic: 'Troubleshooting and login help',
  },
  {
    id: '5',
    topic: 'Learn about privacy settings',
  },
  {
    id: '6',
    topic: 'Controlling your visibility',
  },
  {
    id: '7',
    topic: 'Blocking people',
  },
  {
    id: '8',
    topic: 'Report something',
  },
]

export function HelpPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-brand-primary" />
            <h1 className="text-2xl font-bold text-text">Help</h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text mb-4">Popular Topics</h2>
              <div className="space-y-2">
                {popularTopics.map((item) => (
                  <Link
                    key={item.id}
                    to={`/help/${item.id}`}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <span className="text-text font-medium">{item.topic}</span>
                    <ChevronRight className="w-5 h-5 text-text-muted" />
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

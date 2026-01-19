import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui'
import { ArrowLeft, Info } from 'lucide-react'

const companyPolicies = [
  'ReelTok has a zero tolerance policy for abusive behavior, bullying, or objectionable content, and reserves the right to terminate, suspend, or otherwise restrict your use of and access to this ReelTok, or any portion hereof, with or without notice at any time for actions that violate our terms of service',
]

export function AboutPage() {
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
            <Info className="w-6 h-6 text-brand-primary" />
            <h1 className="text-2xl font-bold text-text">About</h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Company Policies */}
              <div>
                <h2 className="text-lg font-semibold text-text mb-4">Company Policies</h2>
                <div className="space-y-3">
                  {companyPolicies.map((policy, index) => (
                    <p key={index} className="text-sm text-text-secondary leading-relaxed">
                      {policy}
                    </p>
                  ))}
                </div>
              </div>

              {/* Terms of Service Link */}
              <div className="pt-4 border-t border-border">
                <h2 className="text-lg font-semibold text-text mb-4">Terms of Service</h2>
                <a
                  href="https://app.reeltoksocial.com/terms-and-services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline font-medium"
                >
                  View Terms of Service →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

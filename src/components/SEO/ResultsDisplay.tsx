import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, TrendingUp, TrendingDown, Clock, Zap, Smartphone, Globe, Code, Image, Link2, Lightbulb, BookOpen } from 'lucide-react';

interface ResultsDisplayProps {
  title: string;
  success: boolean;
  data: any;
  suggestions?: string[];
  icon?: React.ReactNode;
  metrics?: Array<{
    label: string;
    value: string | number;
    status?: 'good' | 'warning' | 'error';
    icon?: React.ReactNode;
  }>;
  details?: Array<{
    label: string;
    value: string | number | boolean;
    status?: 'good' | 'warning' | 'error';
  }>;
  improvementGuide?: Array<{
    title: string;
    description: string;
    steps: string[];
    icon?: React.ReactNode;
  }>;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  title,
  success,
  data,
  suggestions = [],
  icon,
  metrics = [],
  details = [],
  improvementGuide = []
}) => {
  const getStatusIcon = (status?: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status?: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        {icon && <div className="text-2xl">{icon}</div>}
        <div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2 mt-1">
            {success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${success ? 'text-green-600' : 'text-red-600'}`}>
              {success ? 'Analysis Complete' : 'Analysis Failed'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {metric.icon && <div className="text-lg">{metric.icon}</div>}
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                {getStatusIcon(metric.status)}
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{metric.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Section */}
      {details.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Detailed Analysis</h4>
          <div className="space-y-3">
            {details.map((detail, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-600">{detail.label}</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${getStatusColor(detail.status).split(' ')[0]}`}>
                    {typeof detail.value === 'boolean' ? (detail.value ? 'Yes' : 'No') : detail.value}
                  </span>
                  {getStatusIcon(detail.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Quick Recommendations
          </h4>
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-3 text-blue-700">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Improvement Guide */}
      {improvementGuide.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-purple-800 mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            How to Improve Your SEO
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {improvementGuide.map((guide, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  {guide.icon && <div className="text-purple-600">{guide.icon}</div>}
                  <h5 className="font-semibold text-gray-800">{guide.title}</h5>
                </div>
                <p className="text-sm text-gray-600 mb-3">{guide.description}</p>
                <div className="space-y-2">
                  {guide.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-2">
                      <span className="text-xs bg-purple-100 text-purple-600 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {stepIndex + 1}
                      </span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data (Collapsible) */}
      <details className="bg-gray-50 rounded-lg p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
          View Raw Data
        </summary>
        <pre className="mt-3 text-xs bg-white p-3 rounded border overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default ResultsDisplay; 
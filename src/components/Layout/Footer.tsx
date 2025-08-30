import React, { useEffect, useState } from 'react';

interface VersionInfo {
  commit: string;
  buildTime: string;
  version: string;
  environment: string;
  uptime: number;
  timestamp: number;
}

const Footer: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch('/api/health/version');
        if (response.ok) {
          const data = await response.json();
          setVersionInfo(data);
        }
      } catch (error) {
        console.log('Could not fetch version info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVersionInfo();
  }, []);

  // Log build info to console for deployment verification
  useEffect(() => {
    console.log('🚀 DEPLOYMENT INFO:', {
      commit: (window as any).__COMMIT_SHA__,
      buildTime: (window as any).__BUILD_TIME__,
      version: (window as any).__BUILD_VERSION__,
      timestamp: (window as any).__TIMESTAMP__
    });
  }, []);

  return (
    <footer className="bg-primary-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Opptym</h3>
            <p className="text-primary-300 mb-4">
              AI-Powered SEO Automation Platform for directory submissions and backlink building.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-300 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/dashboard" className="text-primary-300 hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/projects" className="text-primary-300 hover:text-white transition-colors">Projects</a></li>
              <li><a href="/seo-tools" className="text-primary-300 hover:text-white transition-colors">SEO Tools</a></li>
              <li><a href="/pricing" className="text-primary-300 hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-300 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-primary-300 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-primary-300 hover:text-white transition-colors">API Docs</a></li>
            </ul>
          </div>
        </div>

        {/* Build Info for Deployment Verification */}
        <div className="border-t border-primary-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-primary-400">
            <div className="mb-2 md:mb-0">
              © 2024 Opptym. All rights reserved.
            </div>
            <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4 text-xs">
              {loading ? (
                <span>Loading build info...</span>
              ) : versionInfo ? (
                <>
                  <span>Build: {versionInfo.commit.substring(0, 8)}</span>
                  <span>Version: {versionInfo.version}</span>
                  <span>Env: {versionInfo.environment}</span>
                  <span>Built: {new Date(versionInfo.buildTime).toLocaleString()}</span>
                </>
              ) : (
                <>
                  <span>Build: {(window as any).__COMMIT_SHA__?.substring(0, 8) || 'unknown'}</span>
                  <span>Version: {(window as any).__BUILD_VERSION__ || 'unknown'}</span>
                  <span>Built: {(window as any).__BUILD_TIME__ ? new Date((window as any).__BUILD_TIME__).toLocaleString() : 'unknown'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getGitCommit = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    return 'unknown';
  }
};

const getGitBranch = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch (e) {
    return 'unknown';
  }
};

const commitSha = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || getGitCommit();
const buildTime = new Date().toISOString();
const buildVersion = process.env.npm_package_version || '3.0.0';
const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || getGitBranch();

const indexPath = path.resolve(__dirname, '../index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const scriptToInject = `
    <script>
      window.__COMMIT_SHA__ = '${commitSha}';
      window.__BUILD_TIME__ = '${buildTime}';
      window.__BUILD_VERSION__ = '${buildVersion}';
      window.__GIT_BRANCH__ = '${gitBranch}';
    </script>
`;

// Inject before the main app script
indexContent = indexContent.replace('<!-- Main App Script -->', `${scriptToInject}\n    <!-- Main App Script -->`);

fs.writeFileSync(indexPath, indexContent, 'utf8');

console.log('✅ Injected build info into index.html');
console.log(`   Commit: ${commitSha.substring(0, 8)}`);
console.log(`   Version: ${buildVersion}`);
console.log(`   Build Time: ${buildTime}`);
console.log(`   Branch: ${gitBranch}`);

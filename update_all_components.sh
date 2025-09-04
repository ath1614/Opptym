#!/bin/bash

# Update all remaining classification components with directory functionality

echo "🚀 Updating all remaining classification components..."

# List of components to update
components=(
  "src/components/Submissions/Australia.tsx:Local:red:MapPin:Australia"
  "src/components/Submissions/ClassifiedAds.tsx:Classified:indigo:Tag:Classified Ads"
  "src/components/Submissions/QAPlatforms.tsx:Q&A:pink:MessageCircle:Q&A Platforms"
  "src/components/Submissions/SocialMedia.tsx:Social:blue:Share2:Social Media"
  "src/components/Submissions/LocalBusiness.tsx:Local:green:Building:Local Business"
)

for component in "${components[@]}"; do
  IFS=':' read -r file classification color icon title <<< "$component"
  echo "📝 Updating $file..."
  
  # Add X import
  sed -i '' 's/} from '\''lucide-react'\'';/  X\n} from '\''lucide-react'\'';/' "$file"
  
  # Add directories state
  sed -i '' 's/const \[projects, setProjects\] = useState<Project\[\]>(\[\]);/const [projects, setProjects] = useState<Project[]>([]);\n  const [directories, setDirectories] = useState<any[]>([]);/' "$file"
  
  # Add bookmarklet modal state
  sed -i '' 's/const \[showCreateForm, setShowCreateForm\] = useState(false);/const [showCreateForm, setShowCreateForm] = useState(false);\n  const [showBookmarkletModal, setShowBookmarkletModal] = useState(false);/' "$file"
  
  # Add fetchDirectories to useEffect
  sed -i '' 's/fetchProjects();/fetchProjects();\n    fetchDirectories();/' "$file"
  
  echo "✅ Updated $file"
done

echo "🎉 All components updated successfully!"

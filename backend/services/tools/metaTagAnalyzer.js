const analyzeMetaTags = (project) => {
    const errors = [];
    const suggestions = [];
  
    if (!project.metaTitle || project.metaTitle.length < 30 || project.metaTitle.length > 70)
      suggestions.push('Meta title should be between 30 and 70 characters.');
  
    if (!project.metaDescription || project.metaDescription.length < 50 || project.metaDescription.length > 160)
      suggestions.push('Meta description should be between 50 and 160 characters.');
  
    if (!project.keywords?.length) {
      suggestions.push('Add relevant keywords to improve targeting.');
    } else {
      const usedKeywords = project.keywords.filter(k =>
        project.metaTitle?.toLowerCase().includes(k.toLowerCase()) ||
        project.metaDescription?.toLowerCase().includes(k.toLowerCase())
      );
      suggestions.push(`Keywords used: ${usedKeywords.length} / ${project.keywords.length}`);
    }
  
    return {
      success: true,
      titleLength: project.metaTitle?.length || 0,
      descriptionLength: project.metaDescription?.length || 0,
      keywords: project.keywords || [],
      suggestions
    };
  };
  
  module.exports = { analyzeMetaTags };
  
export interface ProjectData {
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  description?: string;
  category?: string;
  title?: string;
  businessPhone?: string;
  whatsapp?: string;
  buildingName?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  district?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  targetKeywords?: string[];
  articleTitle?: string;
  articleContent?: string;
  authorName?: string;
  authorBio?: string;
  tags?: string[];
  productName?: string;
  price?: string;
  condition?: string;
  productImageUrl?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  businessHours?: string;
  establishedYear?: string;
  logoUrl?: string;
  sitemapUrl?: string;
  robotsTxtUrl?: string;
}

export interface FieldMapping {
  patterns: string[];
  value: string | undefined;
  confidence: number;
  fieldType: string;
}

export interface MappingResult {
  value: string | undefined;
  confidence: number;
  fieldType: string;
  matchedPattern: string;
}

export class EnhancedFieldMapper {
  private projectData: ProjectData;
  private fieldMappings: FieldMapping[];

  constructor(projectData: ProjectData) {
    this.projectData = projectData;
    this.fieldMappings = this.initializeFieldMappings();
  }

  private initializeFieldMappings(): FieldMapping[] {
    return [
      // Email fields - High confidence
      {
        patterns: ['email', 'e-mail', 'mail', 'emailaddress', 'email_address', 'useremail', 'contactemail'],
        value: this.projectData.email,
        confidence: 0.95,
        fieldType: 'email'
      },
      
      // Name fields - High confidence
      {
        patterns: ['name', 'fullname', 'full_name', 'firstname', 'first_name', 'lastname', 'last_name', 'contactname', 'contact_name', 'personname', 'person_name', 'username', 'user_name', 'displayname', 'display_name'],
        value: this.projectData.name,
        confidence: 0.9,
        fieldType: 'name'
      },
      
      // Phone fields - High confidence
      {
        patterns: ['phone', 'telephone', 'mobile', 'cell', 'contact', 'phonenumber', 'phone_number', 'mobilephone', 'mobile_phone', 'cellphone', 'cell_phone', 'tel', 'telephone_number'],
        value: this.projectData.phone || this.projectData.businessPhone,
        confidence: 0.9,
        fieldType: 'phone'
      },
      
      // WhatsApp fields - Medium confidence
      {
        patterns: ['whatsapp', 'whats_app', 'wa', 'whatsappnumber', 'whatsapp_number'],
        value: this.projectData.whatsapp,
        confidence: 0.8,
        fieldType: 'whatsapp'
      },
      
      // Company/Business fields - High confidence
      {
        patterns: ['company', 'companyname', 'company_name', 'business', 'businessname', 'business_name', 'organization', 'org', 'firm', 'enterprise', 'corporation', 'corp', 'companyname', 'company_name', 'businessname', 'business_name', 'organizationname', 'organization_name', 'firmname', 'firm_name'],
        value: this.projectData.companyName,
        confidence: 0.9,
        fieldType: 'company'
      },
      
      // Website/URL fields - High confidence
      {
        patterns: ['website', 'url', 'site', 'web', 'homepage', 'home_page', 'websiteurl', 'website_url', 'siteurl', 'site_url', 'weburl', 'web_url', 'domain', 'webaddress', 'web_address'],
        value: this.projectData.url,
        confidence: 0.9,
        fieldType: 'website'
      },
      
      // Address fields - Medium confidence
      {
        patterns: ['address', 'street', 'streetaddress', 'street_address', 'location', 'addr', 'fulladdress', 'full_address', 'businessaddress', 'business_address', 'companyaddress', 'company_address'],
        value: this.projectData.address || this.projectData.address1,
        confidence: 0.8,
        fieldType: 'address'
      },
      
      // Building name fields - Medium confidence
      {
        patterns: ['building', 'buildingname', 'building_name', 'buildingaddress', 'building_address', 'premises', 'office', 'officename', 'office_name'],
        value: this.projectData.buildingName,
        confidence: 0.7,
        fieldType: 'building'
      },
      
      // City fields - Medium confidence
      {
        patterns: ['city', 'town', 'municipality', 'locality', 'place', 'urban', 'metro'],
        value: this.projectData.city,
        confidence: 0.8,
        fieldType: 'city'
      },
      
      // State/Province fields - Medium confidence
      {
        patterns: ['state', 'province', 'region', 'territory', 'county', 'district', 'area', 'zone'],
        value: this.projectData.state,
        confidence: 0.8,
        fieldType: 'state'
      },
      
      // Country fields - Medium confidence
      {
        patterns: ['country', 'nation', 'land', 'territory', 'republic', 'kingdom'],
        value: this.projectData.country,
        confidence: 0.8,
        fieldType: 'country'
      },
      
      // Zip/Postal code fields - Medium confidence
      {
        patterns: ['zip', 'postal', 'pincode', 'pin_code', 'postcode', 'post_code', 'zipcode', 'zip_code', 'postalcode', 'postal_code', 'code', 'postalnumber', 'postal_number'],
        value: this.projectData.pincode,
        confidence: 0.8,
        fieldType: 'postal'
      },
      
      // Description fields - Medium confidence
      {
        patterns: ['description', 'desc', 'about', 'details', 'message', 'comment', 'notes', 'info', 'information', 'summary', 'overview', 'content', 'text', 'body', 'bio', 'biography', 'profile', 'introduction', 'intro'],
        value: this.projectData.description,
        confidence: 0.7,
        fieldType: 'description'
      },
      
      // Category fields - Medium confidence
      {
        patterns: ['category', 'cat', 'type', 'industry', 'sector', 'field', 'domain', 'niche', 'classification', 'class', 'group', 'genre', 'style'],
        value: this.projectData.category,
        confidence: 0.7,
        fieldType: 'category'
      },
      
      // Title fields - Medium confidence
      {
        patterns: ['title', 'headline', 'heading', 'subject', 'topic', 'theme', 'name', 'label', 'caption'],
        value: this.projectData.title || this.projectData.companyName,
        confidence: 0.7,
        fieldType: 'title'
      },
      
      // Meta title fields - Low confidence
      {
        patterns: ['metatitle', 'meta_title', 'seotitle', 'seo_title', 'pagetitle', 'page_title', 'htmltitle', 'html_title'],
        value: this.projectData.metaTitle,
        confidence: 0.6,
        fieldType: 'meta_title'
      },
      
      // Meta description fields - Low confidence
      {
        patterns: ['metadescription', 'meta_description', 'seodescription', 'seo_description', 'pagedescription', 'page_description', 'htmldescription', 'html_description'],
        value: this.projectData.metaDescription,
        confidence: 0.6,
        fieldType: 'meta_description'
      },
      
      // Keywords fields - Low confidence
      {
        patterns: ['keywords', 'keyword', 'tags', 'tag', 'seokeywords', 'seo_keywords', 'metakeywords', 'meta_keywords', 'searchterms', 'search_terms'],
        value: this.projectData.keywords?.join(', ') || this.projectData.targetKeywords?.join(', '),
        confidence: 0.6,
        fieldType: 'keywords'
      },
      
      // Article title fields - Medium confidence
      {
        patterns: ['articletitle', 'article_title', 'posttitle', 'post_title', 'blogtitle', 'blog_title', 'newstitle', 'news_title', 'headline'],
        value: this.projectData.articleTitle,
        confidence: 0.7,
        fieldType: 'article_title'
      },
      
      // Article content fields - Medium confidence
      {
        patterns: ['articlecontent', 'article_content', 'postcontent', 'post_content', 'blogcontent', 'blog_content', 'newscontent', 'news_content', 'body', 'content', 'text', 'article', 'post', 'blog'],
        value: this.projectData.articleContent,
        confidence: 0.7,
        fieldType: 'article_content'
      },
      
      // Author name fields - Medium confidence
      {
        patterns: ['authorname', 'author_name', 'writername', 'writer_name', 'authorname', 'author_name', 'creatorname', 'creator_name', 'authorname', 'author_name'],
        value: this.projectData.authorName,
        confidence: 0.7,
        fieldType: 'author_name'
      },
      
      // Author bio fields - Low confidence
      {
        patterns: ['authorbio', 'author_bio', 'writerbio', 'writer_bio', 'authorbiography', 'author_biography', 'authordescription', 'author_description'],
        value: this.projectData.authorBio,
        confidence: 0.6,
        fieldType: 'author_bio'
      },
      
      // Product name fields - Medium confidence
      {
        patterns: ['productname', 'product_name', 'itemname', 'item_name', 'product', 'item', 'goods', 'merchandise'],
        value: this.projectData.productName,
        confidence: 0.7,
        fieldType: 'product_name'
      },
      
      // Price fields - Medium confidence
      {
        patterns: ['price', 'cost', 'amount', 'value', 'rate', 'fee', 'charge', 'pricing', 'costing', 'amount', 'value'],
        value: this.projectData.price,
        confidence: 0.7,
        fieldType: 'price'
      },
      
      // Condition fields - Low confidence
      {
        patterns: ['condition', 'status', 'state', 'quality', 'grade', 'level', 'type', 'kind'],
        value: this.projectData.condition,
        confidence: 0.6,
        fieldType: 'condition'
      },
      
      // Business hours fields - Low confidence
      {
        patterns: ['businesshours', 'business_hours', 'workinghours', 'working_hours', 'openhours', 'open_hours', 'hours', 'schedule', 'timing', 'time'],
        value: this.projectData.businessHours,
        confidence: 0.6,
        fieldType: 'business_hours'
      },
      
      // Established year fields - Low confidence
      {
        patterns: ['established', 'establishedyear', 'established_year', 'founded', 'foundedyear', 'founded_year', 'started', 'startedyear', 'started_year', 'since', 'year', 'foundingyear', 'founding_year'],
        value: this.projectData.establishedYear,
        confidence: 0.6,
        fieldType: 'established_year'
      }
    ];
  }

  public mapFieldToValue(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): MappingResult | null {
    const fieldName = this.extractFieldName(input);
    const fieldType = input.type?.toLowerCase() || 'text';
    
    console.log('🔍 Enhanced field mapping:', {
      fieldName: fieldName,
      fieldType: fieldType,
      originalName: input.name,
      originalId: input.id,
      originalPlaceholder: input.placeholder,
      className: input.className
    });

    // Find the best matching field mapping
    let bestMatch: MappingResult | null = null;
    let highestConfidence = 0;

    for (const mapping of this.fieldMappings) {
      for (const pattern of mapping.patterns) {
        if (fieldName.includes(pattern)) {
          const confidence = this.calculateConfidence(mapping, fieldName, fieldType, pattern);
          
          if (confidence > highestConfidence && mapping.value) {
            bestMatch = {
              value: mapping.value,
              confidence: confidence,
              fieldType: mapping.fieldType,
              matchedPattern: pattern
            };
            highestConfidence = confidence;
          }
        }
      }
    }

    // Additional type-based matching for better accuracy
    if (!bestMatch) {
      bestMatch = this.typeBasedMapping(input, fieldName, fieldType);
    }

    if (bestMatch && bestMatch.confidence > 0.5) {
      console.log(`✅ Enhanced match found:`, {
        field: fieldName,
        value: bestMatch.value,
        confidence: bestMatch.confidence,
        fieldType: bestMatch.fieldType,
        matchedPattern: bestMatch.matchedPattern
      });
      return bestMatch;
    }

    console.log(`❌ No enhanced match found for field:`, fieldName);
    return null;
  }

  private extractFieldName(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
    const sources = [
      input.name,
      input.id,
      input.placeholder,
      input.getAttribute('data-field'),
      input.getAttribute('aria-label'),
      input.getAttribute('title'),
      input.className
    ].filter(Boolean);

    return sources.join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private calculateConfidence(mapping: FieldMapping, fieldName: string, fieldType: string, pattern: string): number {
    let confidence = mapping.confidence;

    // Boost confidence for exact matches
    if (fieldName === pattern) {
      confidence += 0.2;
    }

    // Boost confidence for type matches
    if (fieldType === mapping.fieldType) {
      confidence += 0.1;
    }

    // Boost confidence for email type
    if (fieldType === 'email' && mapping.fieldType === 'email') {
      confidence += 0.1;
    }

    // Boost confidence for tel type
    if (fieldType === 'tel' && mapping.fieldType === 'phone') {
      confidence += 0.1;
    }

    // Boost confidence for url type
    if (fieldType === 'url' && mapping.fieldType === 'website') {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private typeBasedMapping(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, fieldName: string, fieldType: string): MappingResult | null {
    // Type-based fallback matching
    switch (fieldType) {
      case 'email':
        if (this.projectData.email) {
          return {
            value: this.projectData.email,
            confidence: 0.8,
            fieldType: 'email',
            matchedPattern: 'type-based'
          };
        }
        break;
      
      case 'tel':
        if (this.projectData.phone || this.projectData.businessPhone) {
          return {
            value: this.projectData.phone || this.projectData.businessPhone,
            confidence: 0.8,
            fieldType: 'phone',
            matchedPattern: 'type-based'
          };
        }
        break;
      
      case 'url':
        if (this.projectData.url) {
          return {
            value: this.projectData.url,
            confidence: 0.8,
            fieldType: 'website',
            matchedPattern: 'type-based'
          };
        }
        break;
      
      case 'textarea':
        if (this.projectData.description) {
          return {
            value: this.projectData.description,
            confidence: 0.6,
            fieldType: 'description',
            matchedPattern: 'type-based'
          };
        }
        break;
    }

    return null;
  }

  public getUnrecognizedFields(inputs: (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[]): string[] {
    const unrecognized: string[] = [];
    
    for (const input of inputs) {
      const fieldName = this.extractFieldName(input);
      const result = this.mapFieldToValue(input);
      
      if (!result || result.confidence < 0.5) {
        unrecognized.push(fieldName);
      }
    }
    
    return unrecognized;
  }

  public getMappingStats(inputs: (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[]): {
    total: number;
    recognized: number;
    unrecognized: number;
    confidence: number;
  } {
    let recognized = 0;
    let totalConfidence = 0;
    
    for (const input of inputs) {
      const result = this.mapFieldToValue(input);
      if (result && result.confidence >= 0.5) {
        recognized++;
        totalConfidence += result.confidence;
      }
    }
    
    return {
      total: inputs.length,
      recognized: recognized,
      unrecognized: inputs.length - recognized,
      confidence: recognized > 0 ? totalConfidence / recognized : 0
    };
  }
}

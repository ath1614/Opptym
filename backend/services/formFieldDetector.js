const axios = require('axios');

// Free LLM API endpoints (you can use any of these)
const LLM_APIS = {
  // Option 1: Hugging Face Inference API (free tier)
  huggingface: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
  
  // Option 2: OpenAI API (if you have credits)
  openai: 'https://api.openai.com/v1/chat/completions',
  
  // Option 3: Local Ollama (if installed)
  ollama: 'http://localhost:11434/api/generate'
};

class FormFieldDetector {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || process.env.OPENAI_API_KEY;
    this.currentAPI = 'huggingface'; // Default to free option
  }

  // Analyze form structure and detect field types
  async analyzeFormStructure(formHTML, projectData) {
    try {
      const prompt = this.buildAnalysisPrompt(formHTML, projectData);
      const response = await this.callLLM(prompt);
      return this.parseLLMResponse(response);
    } catch (error) {
      console.error('Form analysis failed:', error);
      return this.fallbackFieldMapping(formHTML);
    }
  }

  // Build a comprehensive prompt for the LLM
  buildAnalysisPrompt(formHTML, projectData) {
    return `
You are an expert web form analyzer. Analyze this HTML form and map the form fields to the provided project data.

FORM HTML:
${formHTML}

PROJECT DATA:
${JSON.stringify(projectData, null, 2)}

TASK:
1. Identify all input fields, textareas, and select elements in the form
2. Determine what type of data each field expects (name, email, phone, address, business, description, etc.)
3. Map each field to the appropriate project data field
4. Return a JSON object with field mappings

EXPECTED OUTPUT FORMAT:
{
  "fieldMappings": {
    "selector": "projectField",
    "input[name='email']": "email",
    "input[name='business_name']": "businessName",
    "textarea[name='description']": "metaDescription"
  },
  "confidence": 0.85,
  "detectedFields": [
    {
      "selector": "input[name='email']",
      "type": "email",
      "label": "Email Address",
      "mappedTo": "email"
    }
  ]
}

Focus on common field patterns:
- Name fields: first_name, last_name, full_name, contact_name
- Business fields: business_name, company_name, organization
- Contact fields: email, phone, telephone, mobile
- Address fields: address, street, city, state, zip, country
- Description fields: description, about, details, content
- Website fields: website, url, site_url

Return only valid JSON, no additional text.
`;
  }

  // Call the LLM API
  async callLLM(prompt) {
    switch (this.currentAPI) {
      case 'huggingface':
        return await this.callHuggingFace(prompt);
      case 'openai':
        return await this.callOpenAI(prompt);
      case 'ollama':
        return await this.callOllama(prompt);
      default:
        throw new Error('No valid LLM API configured');
    }
  }

  // Hugging Face Inference API (free tier)
  async callHuggingFace(prompt) {
    try {
      const response = await axios.post(
        LLM_APIS.huggingface,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      return response.data[0]?.generated_text || '';
    } catch (error) {
      console.error('Hugging Face API error:', error.message);
      throw error;
    }
  }

  // OpenAI API (if you have credits)
  async callOpenAI(prompt) {
    try {
      const response = await axios.post(
        LLM_APIS.openai,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert web form analyzer. Return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      throw error;
    }
  }

  // Local Ollama (if installed)
  async callOllama(prompt) {
    try {
      const response = await axios.post(
        LLM_APIS.ollama,
        {
          model: 'llama2',
          prompt: prompt,
          stream: false
        },
        {
          timeout: 30000
        }
      );
      return response.data.response || '';
    } catch (error) {
      console.error('Ollama API error:', error.message);
      throw error;
    }
  }

  // Parse LLM response and extract field mappings
  parseLLMResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          fieldMappings: parsed.fieldMappings || {},
          confidence: parsed.confidence || 0.5,
          detectedFields: parsed.detectedFields || []
        };
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return this.fallbackFieldMapping();
    }
  }

  // Fallback field mapping using common patterns
  fallbackFieldMapping(formHTML = '') {
    const commonMappings = {
      // Name fields
      'input[name*="first"]': 'contactName.first',
      'input[name*="last"]': 'contactName.last',
      'input[name*="name"]': 'name',
      'input[name*="full"]': 'name',
      
      // Business fields
      'input[name*="business"]': 'businessName',
      'input[name*="company"]': 'businessName',
      'input[name*="organization"]': 'businessName',
      
      // Contact fields
      'input[type="email"]': 'email',
      'input[name*="email"]': 'email',
      'input[name*="phone"]': 'phone',
      'input[name*="telephone"]': 'phone',
      'input[name*="mobile"]': 'phone',
      
      // Address fields
      'input[name*="address"]': 'address',
      'input[name*="street"]': 'address',
      'input[name*="city"]': 'city',
      'input[name*="state"]': 'state',
      'input[name*="zip"]': 'pincode',
      'input[name*="country"]': 'country',
      
      // Description fields
      'textarea[name*="description"]': 'metaDescription',
      'textarea[name*="about"]': 'metaDescription',
      'textarea[name*="details"]': 'metaDescription',
      'textarea[name*="content"]': 'metaDescription',
      
      // Website fields
      'input[name*="website"]': 'url',
      'input[name*="url"]': 'url',
      'input[name*="site"]': 'url'
    };

    return {
      fieldMappings: commonMappings,
      confidence: 0.3,
      detectedFields: Object.keys(commonMappings).map(selector => ({
        selector,
        type: 'auto-detected',
        label: 'Common pattern',
        mappedTo: commonMappings[selector]
      }))
    };
  }

  // Smart field detection using DOM analysis
  async detectFieldsFromDOM(page) {
    try {
      const formData = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        const fields = [];
        
        forms.forEach((form, formIndex) => {
          const inputs = form.querySelectorAll('input, textarea, select');
          
          inputs.forEach((input, inputIndex) => {
            const field = {
              selector: this.generateSelector(input),
              type: input.type || input.tagName.toLowerCase(),
              name: input.name || '',
              id: input.id || '',
              placeholder: input.placeholder || '',
              label: this.findLabel(input),
              required: input.required || false,
              formIndex,
              inputIndex
            };
            fields.push(field);
          });
        });
        
        return fields;
      });

      return formData;
    } catch (error) {
      console.error('DOM field detection failed:', error);
      return [];
    }
  }

  // Generate unique CSS selector for an element
  generateSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.name) return `${element.tagName.toLowerCase()}[name="${element.name}"]`;
    if (element.className) return `${element.tagName.toLowerCase()}.${element.className.split(' ')[0]}`;
    return `${element.tagName.toLowerCase()}:nth-child(${Array.from(element.parentNode.children).indexOf(element) + 1})`;
  }

  // Find associated label for an input
  findLabel(input) {
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent.trim();
    }
    
    const parent = input.parentElement;
    const label = parent.querySelector('label');
    if (label) return label.textContent.trim();
    
    return '';
  }
}

module.exports = new FormFieldDetector(); 
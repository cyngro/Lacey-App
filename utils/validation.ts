export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateMessage = (content: string, messageType: string): ValidationResult => {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('Message content is required');
  }

  if (content && content.trim().length > 500) {
    errors.push('Message is too long (maximum 500 characters)');
  }

  if (messageType === 'image_generation' && content.trim().length < 10) {
    errors.push('Image generation prompts should be at least 10 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateConversationTitle = (title: string): ValidationResult => {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('Conversation title is required');
  }

  if (title && title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (title && title.trim().length > 50) {
    errors.push('Title is too long (maximum 50 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateImageUpload = (image: any, content: string): ValidationResult => {
  const errors: string[] = [];

  if (!image) {
    errors.push('Please select an image');
  }

  if (image && image.fileSize && image.fileSize > 10 * 1024 * 1024) { // 10MB limit
    errors.push('Image file is too large (maximum 10MB)');
  }

  if (!content || content.trim().length === 0) {
    errors.push('Edit instructions are required');
  }

  if (content && content.trim().length > 200) {
    errors.push('Edit instructions are too long (maximum 200 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  } catch {
    return false;
  }
};

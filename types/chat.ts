export interface Message {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: 'text' | 'image_generation' | 'image_edit' | 'image_upload';
  imageUrl?: string;
  previousImageUrl?: string;
  metadata?: {
    imageSize: number;
    imageSizeMB: string;
    originalOpenAIUrl: string;
    compressedImage: string;
  };
  timestamp: string;
}

export interface Conversation {
  conversationId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ConversationDetails extends Conversation {
  messages: Message[];
}

export interface CreateConversationRequest {
  title: string;
}

export interface CreateConversationResponse {
  success: boolean;
  message: string;
  data: {
    conversationId: string;
    title: string;
    createdAt: string;
  };
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType: 'text' | 'image_generation' | 'image_edit' | 'image_upload';
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    conversationId: string;
    userMessage: Message;
    assistantMessage: Message;
  };
}

export interface UploadImageRequest {
  conversationId: string;
  content: string;
  messageType: 'image_upload';
  image: any; // File object for React Native
}

export interface GetConversationsResponse {
  success: boolean;
  message: string;
  data: {
    conversations: Conversation[];
    pagination: {
      current: number;
      total: number;
      pages: number;
      limit: number;
    };
  };
}

export interface GetConversationDetailsResponse {
  success: boolean;
  message: string;
  data: ConversationDetails;
}

export interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  totalImages: number;
  averageMessagesPerConversation: number;
  averageImagesPerConversation: number;
  mostActiveDay: string;
  messagesToday: number;
  imagesToday: number;
}

export interface GetStatsResponse {
  success: boolean;
  message: string;
  data: ConversationStats;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
}

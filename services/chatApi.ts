import { API_URL } from '../constants/api';
import {
  CreateConversationRequest,
  CreateConversationResponse,
  SendMessageRequest,
  SendMessageResponse,
  UploadImageRequest,
  GetConversationsResponse,
  GetConversationDetailsResponse,
  GetStatsResponse,
  ApiError,
  Conversation,
  ConversationDetails,
  ConversationStats
} from '../types/chat';

class ChatApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const { getToken } = await import('../utils/authStorage');
      const token = await getToken();
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
        };
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
    return {};
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const authHeaders = await this.getAuthHeaders();
      const isFormData = options.body instanceof FormData;
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          ...(!isFormData && { 'Content-Type': 'application/json' }),
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Create a new conversation
  async createConversation(data: CreateConversationRequest): Promise<CreateConversationResponse> {
    return this.makeRequest<CreateConversationResponse>('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Send a message to a conversation
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return this.makeRequest<SendMessageResponse>(
      `/api/chat/conversations/${data.conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // Upload and edit an image
  async uploadImage(data: UploadImageRequest): Promise<SendMessageResponse> {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('content', data.content);
    formData.append('messageType', data.messageType);
    
    return this.makeRequest<SendMessageResponse>(
      `/api/chat/conversations/${data.conversationId}/messages/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
  }

  // Get conversation details with messages
  async getConversationDetails(conversationId: string): Promise<GetConversationDetailsResponse> {
    return this.makeRequest<GetConversationDetailsResponse>(
      `/api/chat/conversations/${conversationId}/details`
    );
  }

  // Get all conversations with pagination
  async getConversations(page: number = 1, limit: number = 10): Promise<GetConversationsResponse> {
    return this.makeRequest<GetConversationsResponse>(
      `/api/chat/conversations?page=${page}&limit=${limit}`
    );
  }

  // Get conversation statistics
  async getStats(): Promise<GetStatsResponse> {
    return this.makeRequest<GetStatsResponse>('/api/chat/conversations/stats');
  }

  // Clear conversation messages
  async clearConversation(conversationId: string): Promise<{ success: boolean; message: string; data: { conversationId: string; clearedAt: string } }> {
    return this.makeRequest(`/api/chat/conversations/${conversationId}/clear`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string; data: { conversationId: string; deletedAt: string } }> {
    return this.makeRequest(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
  }
}

export const chatApiService = new ChatApiService();

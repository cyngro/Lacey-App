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
import { getToken } from '../utils/authStorage';

class ChatApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Clone the response so we can read it multiple times
      const clonedResponse = response.clone();
      try {
        const errorData: ApiError = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      } catch (parseError) {
        // If JSON parsing failed, try to get text from the cloned response
        try {
          const text = await clonedResponse.text();
          console.error('Error response text:', text);
        } catch (textError) {
          console.error('Failed to read error response:', textError);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    return response.json();
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
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
    console.log('Upload image - conversationId:', data.conversationId);
    console.log('Upload image - image data:', {
      uri: data.image.uri,
      type: data.image.type,
      fileName: data.image.fileName,
      fileSize: data.image.fileSize,
    });
    
    // Format image for React Native FormData - create fresh object to avoid "Already read" error
    const imageUri = data.image.uri;
    const imageType = data.image.type || 'image/jpeg';
    const imageName = data.image.fileName || `image_${Date.now()}.jpg`;
    
    // Create a completely fresh file object for FormData
    const formData = new FormData();
    formData.append('conversationId', data.conversationId);
    formData.append('image', {
      uri: imageUri,
      type: imageType,
      name: imageName,
    } as any);
    formData.append('content', data.content);
    formData.append('messageType', data.messageType);
    
    console.log('Uploading to:', `${this.baseUrl}/api/chat/conversations/${data.conversationId}/messages/upload`);
    console.log('FormData fields:', {
      conversationId: data.conversationId,
      content: data.content,
      messageType: data.messageType,
      hasImage: !!imageUri
    });
    
    try {
      const response = await this.makeRequest<SendMessageResponse>(
        `/api/chat/conversations/${data.conversationId}/messages/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      console.log('Upload successful');
      return response;
    } catch (error) {
      console.error('Upload failed with error:', error);
      throw error;
    }
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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Message } from '../../types/chat';
import { API_URL } from '../../constants/api';

interface MessageBubbleProps {
  message: Message;
  onImagePress?: (imageUrl: string) => void;
  onRetry?: () => void;
  isLoading?: boolean;
}

export default function MessageBubble({
  message,
  onImagePress,
  onRetry,
  isLoading = false,
}: MessageBubbleProps) {
  const [imageLoading, setImageLoading] = useState(!!message.imageUrl);
  const [imageError, setImageError] = useState(false);
  
  const isUser = message.role === 'user';
  const isImageMessage = ['image_generation', 'image_edit', 'image_upload'].includes(message.messageType);

  // Reset loading state when message changes and add timeout
  useEffect(() => {
    if (message.imageUrl) {
      setImageLoading(true);
      setImageError(false);
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.warn('Image loading timeout for message:', message.messageId);
        setImageLoading(prev => {
          if (prev) {
            setImageError(true);
            return false;
          }
          return prev;
        });
      }, 30000); // 30 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [message.messageId, message.imageUrl]);

  // Fix image URL to use correct API URL
  const getImageUrl = (url: string) => {
    console.log('Original image URL:', url);
    
    // If the URL is already absolute with a protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // For localhost URLs, keep them as-is since they should work on the same machine
      // On Android emulator, 10.0.2.2 maps to host machine localhost
      console.log('Using URL as-is:', url);
      return url;
    }
    // If it's a relative URL, construct the full URL
    if (url.startsWith('/')) {
      const fullUrl = `${API_URL}${url}`;
      console.log('Constructed full URL:', fullUrl);
      return fullUrl;
    }
    // Otherwise return as is (shouldn't happen for backend images)
    console.warn('Warning: URL format unexpected:', url);
    return url;
  };

  // Removed debug logging to prevent infinite loops

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = () => {
    switch (message.messageType) {
      case 'image_generation':
        return 'auto-fix-high';
      case 'image_edit':
        return 'edit';
      case 'image_upload':
        return 'cloud-upload';
      default:
        return 'chat';
    }
  };

  const getMessageTypeLabel = () => {
    switch (message.messageType) {
      case 'image_generation':
        return 'Generated Image';
      case 'image_edit':
        return 'Edited Image';
      case 'image_upload':
        return 'Uploaded Image';
      default:
        return 'Message';
    }
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {/* Message Type Indicator - removed for cleaner UI */}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={isUser ? "#fff" : "#00234C"} />
            <Text style={[styles.loadingText, isUser ? styles.userText : styles.assistantText]}>
              {isImageMessage ? 'Generating image...' : 'Thinking...'}
            </Text>
          </View>
        )}

        {/* Message Content */}
        {!isLoading && (
          <>
            {/* Image Display */}
            {message.imageUrl && (
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => onImagePress?.(message.imageUrl!)}
                activeOpacity={0.8}
              >
                {imageLoading && (
                  <View style={styles.imageLoadingContainer}>
                    <ActivityIndicator size="large" color="#00234C" />
                    <Text style={styles.imageLoadingText}>Loading image...</Text>
                  </View>
                )}
                
                {imageError ? (
                  <View style={styles.imageErrorContainer}>
                    <MaterialIcons name="broken-image" size={48} color="#CCC" />
                    <Text style={styles.imageErrorText}>Failed to load image</Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={() => {
                        setImageError(false);
                        setImageLoading(true);
                      }}
                    >
                      <MaterialIcons name="refresh" size={16} color="#00234C" />
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Image
                      source={{ 
                        uri: getImageUrl(message.imageUrl!),
                        cache: 'force-cache'
                      }}
                      style={styles.messageImage}
                      resizeMode="cover"
                      onLoadStart={() => {
                        console.log('Image load started for message:', message.messageId);
                        setImageError(false);
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully for message:', message.messageId);
                        setImageLoading(false);
                        setImageError(false);
                      }}
                      onError={(error) => {
                        const imageUrl = getImageUrl(message.imageUrl!);
                        console.error('Image load error:', {
                          messageId: message.messageId,
                          error: error.nativeEvent.error,
                          url: imageUrl
                        });
                        setImageLoading(false);
                        setImageError(true);
                      }}
                      onLoadEnd={() => {
                        setImageLoading(false);
                      }}
                    />
                  </>
                )}
                

              </TouchableOpacity>
            )}

            {/* Previous Image (for edits) */}
            {message.previousImageUrl && (
              <View style={styles.previousImageContainer}>
                <Text style={[styles.previousImageLabel, isUser ? styles.userText : styles.assistantText]}>
                  Previous:
                </Text>
                <TouchableOpacity
                  style={styles.previousImageWrapper}
                  onPress={() => onImagePress?.(message.previousImageUrl!)}
                >
                  <Image
                    source={{ uri: message.previousImageUrl }}
                    style={styles.previousImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Text Content - Show for all messages, even image messages if there's no image */}
            {(!isImageMessage || !message.imageUrl) && (
              <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
                {message.content}
              </Text>
            )}

            {/* Metadata - Hidden for cleaner UI */}

            {/* Timestamp */}
            <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
              {formatTimestamp(message.timestamp)}
            </Text>
          </>
        )}

        {/* Retry Button for Failed Messages */}
        {!isLoading && onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <MaterialIcons name="refresh" size={16} color="#666" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#00234C',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  messageTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  messageTypeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#333',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  imageLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  imageErrorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  previousImageContainer: {
    marginBottom: 8,
  },
  previousImageLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  previousImageWrapper: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  previousImage: {
    width: 100,
    height: 100,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  metadataContainer: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  metadataText: {
    fontSize: 12,
    opacity: 0.7,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
  userTimestamp: {
    textAlign: 'right',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  assistantTimestamp: {
    textAlign: 'left',
    color: '#666',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  retryText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
});

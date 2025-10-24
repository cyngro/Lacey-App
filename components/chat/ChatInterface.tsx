import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { chatApiService } from '../../services/chatApi';
import { Message, ConversationDetails } from '../../types/chat';
import MessageBubble from './MessageBubble';
import ImageUploadModal from './ImageUploadModal';

interface ChatInterfaceProps {
  conversationId: string;
  onConversationUpdate?: (conversation: ConversationDetails) => void;
}

export default function ChatInterface({
  conversationId,
  onConversationUpdate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [messageType, setMessageType] = useState<'text' | 'image_generation'>('text');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  const loadConversation = useCallback(async () => {
    try {
      setIsLoadingMessages(true);
      const response = await chatApiService.getConversationDetails(conversationId);
      setMessages(response.data.messages);
      onConversationUpdate?.(response.data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversationId, onConversationUpdate]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollToBottom();
      }
    );

    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      () => {
        scrollToBottom();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardWillShowListener.remove();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const sendMessage = async (content: string, type: 'text' | 'image_generation' | 'image_edit' | 'image_upload' = 'text') => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: Message = {
        messageId: `temp_${Date.now()}`,
        role: 'user',
        content: content.trim(),
        messageType: type,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText('');

      // Send to API
      const response = await chatApiService.sendMessage({
        conversationId,
        content: content.trim(),
        messageType: type,
      });

      // Replace temp message and add assistant response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.messageId !== userMessage.messageId);
        return [...filtered, response.data.userMessage, response.data.assistantMessage];
      });

      // Scroll to bottom
      scrollToBottom();

    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.messageId !== `temp_${Date.now()}`));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (image: any, content: string) => {
    try {
      setIsLoading(true);
      setShowImageModal(false);

      // Add user message immediately
      const userMessage: Message = {
        messageId: `temp_${Date.now()}`,
        role: 'user',
        content: content,
        messageType: 'image_upload',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Upload to API
      const response = await chatApiService.uploadImage({
        conversationId,
        content,
        messageType: 'image_upload',
        image,
      });

      // Replace temp message and add assistant response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.messageId !== userMessage.messageId);
        return [...filtered, response.data.userMessage, response.data.assistantMessage];
      });

      // Scroll to bottom
      scrollToBottom();

    } catch (error) {
      console.error('Failed to upload image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.messageId !== `temp_${Date.now()}`));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePress = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setShowImagePreview(true);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText, messageType);
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const toggleMessageType = () => {
    setMessageType(prev => prev === 'text' ? 'image_generation' : 'text');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      onImagePress={handleImagePress}
      isLoading={isLoading && item.messageId.startsWith('temp_')}
    />
  );

  if (isLoadingMessages) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00234C" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.messageId}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="automatic"
        />

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.inputWrapper}>
            {/* Message Type Toggle */}
            <TouchableOpacity
              style={styles.typeToggle}
              onPress={toggleMessageType}
            >
              <MaterialIcons
                name={messageType === 'text' ? 'chat' : 'auto-fix-high'}
                size={20}
                color="#00234C"
              />
            </TouchableOpacity>

            {/* Text Input */}
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder={
                messageType === 'text'
                  ? 'Type a message...'
                  : 'Describe the image you want to generate...'
              }
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
              onFocus={scrollToBottom}
              onContentSizeChange={scrollToBottom}
            />

            {/* Image Upload Button */}
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => setShowImageModal(true)}
              disabled={isLoading}
            >
              <MaterialIcons name="image" size={20} color="#00234C" />
            </TouchableOpacity>

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Message Type Indicator */}
          <View style={styles.typeIndicator}>
            <Text style={styles.typeText}>
              {messageType === 'text' ? 'Text Message' : 'Image Generation'}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Image Upload Modal */}
      <ImageUploadModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImageSelected={setSelectedImage}
        onUpload={uploadImage}
        isLoading={isLoading}
      />

      {/* Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}
      >
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity
            style={styles.imagePreviewClose}
            onPress={() => setShowImagePreview(false)}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: previewImageUrl }}
            style={styles.imagePreviewImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  messagesContent: {
    paddingVertical: 20,
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  typeToggle: {
    padding: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 8,
    lineHeight: 20,
  },
  imageButton: {
    padding: 10,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
  },
  sendButton: {
    backgroundColor: '#00234C',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#00234C',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  typeIndicator: {
    alignItems: 'center',
    marginTop: 10,
  },
  typeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewImage: {
    width: '90%',
    height: '80%',
  },
});

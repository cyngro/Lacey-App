import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '../components/Header';
import BottomNavbar from '../components/BottomNavbar';
import ChatInterface from '../components/chat/ChatInterface';
import { ConversationDetails } from '../types/chat';
import { chatApiService } from '../services/chatApi';

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load or create a conversation on mount
  useEffect(() => {
    const initializeConversation = async () => {
      // If conversationId is provided from URL, use it
      if (conversationId) {
        setCurrentConversationId(conversationId);
        setIsInitializing(false);
        return;
      }

      // Otherwise, load or create a conversation
      try {
        const response = await chatApiService.getConversations(1, 1);
        
        if (response.data?.conversations?.length > 0) {
          setCurrentConversationId(response.data.conversations[0].conversationId);
        } else {
          // Create a new conversation if none exist
          const createResponse = await chatApiService.createConversation({ title: 'New Chat' });
          setCurrentConversationId(createResponse.data.conversationId);
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        // Try to create a new conversation anyway
        try {
          const createResponse = await chatApiService.createConversation({ title: 'New Chat' });
          setCurrentConversationId(createResponse.data.conversationId);
        } catch (createError) {
          console.error('Failed to create conversation:', createError);
        }
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeConversation();
  }, [conversationId]);

  const handleConversationUpdate = useCallback((conversation: ConversationDetails) => {
    setConversationDetails(conversation);
  }, []);

  const getHeaderTitle = () => {
    if (conversationDetails) {
      return conversationDetails.title;
    }
    return 'AI Chat';
  };

  if (isInitializing || !currentConversationId) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00234C" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
        <BottomNavbar
          activeTab="chat"
          onTabPress={(tab) => {
            if (tab === 'home') {
              router.push('/dashboard');
            } else if (tab === 'profile') {
              router.push('/profile');
            }
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={getHeaderTitle()}
        showBackButton={false}
        rightActions={
          (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                Alert.alert(
                  'Clear Conversation',
                  'Are you sure you want to clear all messages in this conversation?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: () => {
                        // TODO: Implement clear conversation
                        Alert.alert('Info', 'Clear conversation feature will be implemented');
                      },
                    },
                  ]
                );
              }}
            >
              {/* <MaterialIcons name="clear-all" size={24} color="#00234C" /> */}
            </TouchableOpacity>
          )
        }
      />
      
      <View style={styles.content}>
        <ChatInterface
          conversationId={currentConversationId}
          onConversationUpdate={handleConversationUpdate}
        />
      </View>

      <BottomNavbar
        activeTab="chat"
        onTabPress={(tab) => {
          if (tab === 'home') {
            router.push('/dashboard');
          } else if (tab === 'profile') {
            router.push('/profile');
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerButton: {
    padding: 8,
  },
});

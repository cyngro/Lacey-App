import React, { useState, useEffect } from 'react';
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
import ConversationList from '../components/chat/ConversationList';
import { ConversationDetails } from '../types/chat';

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
    }
  }, [conversationId]);

  const handleConversationSelect = (selectedConversationId: string) => {
    setCurrentConversationId(selectedConversationId);
    // Update URL without navigation
    router.setParams({ conversationId: selectedConversationId });
  };

  const handleCreateNewConversation = (title: string) => {
    // This will be handled by the ConversationList component
    // The new conversation will be created and selected automatically
  };

  const handleConversationUpdate = (conversation: ConversationDetails) => {
    setConversationDetails(conversation);
  };

  const handleBackToConversations = () => {
    setCurrentConversationId(null);
    router.setParams({ conversationId: undefined });
  };

  const getHeaderTitle = () => {
    if (conversationDetails) {
      return conversationDetails.title;
    }
    return 'AI Chat';
  };

  const getHeaderSubtitle = () => {
    if (conversationDetails) {
      return `${conversationDetails.messageCount} messages`;
    }
    return 'Start a conversation';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00234C" />
          <Text style={styles.loadingText}>Loading...</Text>
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
        subtitle={getHeaderSubtitle()}
        showBackButton={!!currentConversationId}
        onBackPress={handleBackToConversations}
        rightComponent={
          currentConversationId ? (
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
              <MaterialIcons name="clear-all" size={24} color="#00234C" />
            </TouchableOpacity>
          ) : null
        }
      />
      
      <View style={styles.content}>
        {currentConversationId ? (
          <ChatInterface
            conversationId={currentConversationId}
            onConversationUpdate={handleConversationUpdate}
          />
        ) : (
          <ConversationList
            onConversationSelect={handleConversationSelect}
            onCreateNewConversation={handleCreateNewConversation}
          />
        )}
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

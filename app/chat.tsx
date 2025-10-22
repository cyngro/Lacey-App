import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import BottomNavbar from '../components/BottomNavbar';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const [messages] = useState<Message[]>([
    {
      id: '1',
      text: 'Human',
      sender: 'user',
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      text: 'ai chatbot',
      sender: 'other',
      timestamp: '10:30 AM',
    },
    {
      id: '3',
      text: 'Human',
      sender: 'user',
      timestamp: '10:31 AM',
    },
    {
      id: '4',
      text: 'ai chatbot',
      sender: 'other',
      timestamp: '10:31 AM',
    },
    {
      id: '5',
      text: 'Human',
      sender: 'user',
      timestamp: '10:32 AM',
    },
    {
      id: '6',
      text: 'ai chatbot',
      sender: 'other',
      timestamp: '10:32 AM',
    },
  ]);
  const [newMessage] = useState('');


  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.otherMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userMessageText : styles.otherMessageText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <MaterialIcons name="image" size={20} color="#666" />
            <TextInput
              style={styles.textInput}
              placeholder="Image Generation"
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={() => {}}
              multiline
            />
            <TouchableOpacity style={styles.sendButton}>
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00234C',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: '#00234C',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

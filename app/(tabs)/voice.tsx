import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Mic, MicOff, Volume2, VolumeX, Play, Square } from 'lucide-react-native';
import { chatService } from '@/services/chatService';
import { storageService } from '@/services/storageService';

interface VoiceMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUri?: string;
}

export default function VoiceScreen() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadVoiceHistory();
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const loadVoiceHistory = async () => {
    try {
      const history = await storageService.getVoiceHistory();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load voice history:', error);
    }
  };

  const saveVoiceHistory = async (newMessages: VoiceMessage[]) => {
    try {
      await storageService.saveVoiceHistory(newMessages);
    } catch (error) {
      console.error('Failed to save voice history:', error);
    }
  };

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Voice recording is not available on web. Please use the text chat instead.');
      return;
    }

    try {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);

      // Scale animation for recording button
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);

      // Reset scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      if (uri) {
        await processRecording(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const processRecording = async (audioUri: string) => {
    try {
      // For demo purposes, we'll simulate speech-to-text
      // In a real app, you'd integrate with Google Speech-to-Text, Azure Speech, etc.
      const transcribedText = await simulateSpeechToText();
      
      const userMessage: VoiceMessage = {
        id: Date.now().toString(),
        text: transcribedText,
        isUser: true,
        timestamp: new Date(),
        audioUri,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Get AI response
      const aiResponse = await chatService.getAIResponse(transcribedText);
      
      const aiMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      await saveVoiceHistory(updatedMessages);

      // Speak the AI response
      await speakText(aiResponse);
    } catch (error) {
      console.error('Failed to process recording:', error);
    }
  };

  const simulateSpeechToText = async (): Promise<string> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return demo text - in a real app, this would be actual speech recognition
    const demoResponses = [
      "Hello, how are you today?",
      "Can you help me practice English?",
      "What's the weather like?",
      "I want to improve my pronunciation.",
      "Tell me about yourself.",
    ];
    
    return demoResponses[Math.floor(Math.random() * demoResponses.length)];
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        voice: 'com.apple.ttsbundle.Samantha-compact', // iOS
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Failed to speak text:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Failed to stop speaking:', error);
    }
  };

  const renderVoiceMessage = (message: VoiceMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View style={styles.messageHeader}>
        <Text style={styles.messageSender}>
          {message.isUser ? 'You' : 'AI Assistant'}
        </Text>
        {!message.isUser && (
          <TouchableOpacity
            onPress={() => speakText(message.text)}
            style={styles.speakButton}
          >
            <Volume2 size={14} color="#8B5CF6" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[
        styles.messageText,
        message.isUser ? styles.userMessageText : styles.aiMessageText
      ]}>
        {message.text}
      </Text>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Voice Chat</Text>
        {isSpeaking && (
          <TouchableOpacity onPress={stopSpeaking} style={styles.stopSpeakingButton}>
            <VolumeX size={16} color="#FFFFFF" />
            <Text style={styles.stopSpeakingText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Mic size={48} color="#8B5CF6" />
            <Text style={styles.emptyStateTitle}>Voice Practice</Text>
            {Platform.OS === 'web' ? (
              <Text style={styles.emptyStateText}>
                Voice recording is not supported on web. Please use the text chat tab to practice your English with AI!
              </Text>
            ) : (
              <Text style={styles.emptyStateText}>
                Tap and hold the microphone to start speaking. Practice your English with AI!
              </Text>
            )}
          </View>
        ) : (
          messages.map(renderVoiceMessage)
        )}
      </ScrollView>

      <View style={styles.voiceInputContainer}>
        {Platform.OS === 'web' ? (
          <Text style={styles.instructionText}>
            Voice recording not supported on web
          </Text>
        ) : (
          <Text style={styles.instructionText}>
            {isRecording ? 'Release to send' : 'Hold to speak'}
          </Text>
        )}
        
        <Animated.View style={[
          styles.recordButtonContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              Platform.OS === 'web' && styles.recordButtonDisabled
            ]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            activeOpacity={0.8}
            disabled={Platform.OS === 'web'}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              {isRecording ? (
                <Square size={32} color="#FFFFFF" />
              ) : (
                <Mic size={32} color="#FFFFFF" />
              )}
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {Platform.OS === 'web' ? (
          <Text style={styles.statusText}>
            Use text chat for web version
          </Text>
        ) : (
          <Text style={styles.statusText}>
            {isRecording ? 'Recording...' : isSpeaking ? 'AI Speaking...' : 'Ready to listen'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  stopSpeakingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stopSpeakingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  speakButton: {
    padding: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  voiceInputContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  recordButtonContainer: {
    marginBottom: 16,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordButtonActive: {
    backgroundColor: '#EF4444',
  },
  recordButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.5,
  },
  statusText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
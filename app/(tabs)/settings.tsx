import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { 
  Trash2, 
  Volume2, 
  VolumeX, 
  Info, 
  Smartphone,
  Globe,
  Mic 
} from 'lucide-react-native';
import { storageService } from '@/services/storageService';
import * as Speech from 'expo-speech';

export default function SettingsScreen() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await storageService.getSettings();
      setVoiceEnabled(settings.voiceEnabled ?? true);
      setAutoSpeak(settings.autoSpeak ?? true);
      setSpeechRate(settings.speechRate ?? 0.9);
      setSpeechPitch(settings.speechPitch ?? 1.0);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await storageService.saveSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleVoiceToggle = async (value: boolean) => {
    setVoiceEnabled(value);
    await saveSettings({ voiceEnabled: value, autoSpeak, speechRate, speechPitch });
  };

  const handleAutoSpeakToggle = async (value: boolean) => {
    setAutoSpeak(value);
    await saveSettings({ voiceEnabled, autoSpeak: value, speechRate, speechPitch });
  };

  const testVoice = async () => {
    try {
      await Speech.speak('Hello! This is a test of the AI voice assistant.', {
        language: 'en-US',
        pitch: speechPitch,
        rate: speechRate,
      });
    } catch (error) {
      console.error('Failed to test voice:', error);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all chat history and voice recordings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Failed to clear data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    rightComponent 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    rightComponent: React.ReactNode;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      {rightComponent}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice Settings</Text>
        
        <SettingItem
          icon={<Mic size={20} color="#8B5CF6" />}
          title="Voice Input"
          description="Enable voice recording and speech recognition"
          rightComponent={
            <Switch
              value={voiceEnabled}
              onValueChange={handleVoiceToggle}
              trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
              thumbColor={voiceEnabled ? '#FFFFFF' : '#F3F4F6'}
            />
          }
        />

        <SettingItem
          icon={<Volume2 size={20} color="#8B5CF6" />}
          title="Auto-Speak Responses"
          description="Automatically speak AI responses aloud"
          rightComponent={
            <Switch
              value={autoSpeak}
              onValueChange={handleAutoSpeakToggle}
              trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
              thumbColor={autoSpeak ? '#FFFFFF' : '#F3F4F6'}
            />
          }
        />

        <TouchableOpacity style={styles.testButton} onPress={testVoice}>
          <Volume2 size={16} color="#FFFFFF" />
          <Text style={styles.testButtonText}>Test Voice</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
          <Trash2 size={16} color="#FFFFFF" />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.aboutContainer}>
          <View style={styles.aboutIcon}>
            <Smartphone size={24} color="#8B5CF6" />
          </View>
          <View style={styles.aboutContent}>
            <Text style={styles.aboutTitle}>AI English Assistant</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Practice English conversation with AI-powered voice and text chat. 
              Improve your speaking and listening skills naturally.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for English learners
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
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
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  aboutContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  aboutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aboutContent: {
    flex: 1,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  aboutVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
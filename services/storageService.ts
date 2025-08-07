import { Platform } from 'react-native';

// Conditional import for expo-secure-store to avoid web platform issues
let SecureStore: any = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface VoiceMessage extends Message {
  audioUri?: string;
}

interface Settings {
  voiceEnabled: boolean;
  autoSpeak: boolean;
  speechRate: number;
  speechPitch: number;
}

export class StorageService {
  private readonly CHAT_HISTORY_KEY = 'chat_history';
  private readonly VOICE_HISTORY_KEY = 'voice_history';
  private readonly SETTINGS_KEY = 'app_settings';

  private async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore?.getItemAsync(key) || null;
    }
  }

  private async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore?.setItemAsync(key, value);
    }
  }

  private async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore?.deleteItemAsync(key);
    }
  }

  async getChatHistory(): Promise<Message[]> {
    try {
      const stored = await this.getItem(this.CHAT_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return [];
    }
  }

  async saveChatHistory(messages: Message[]): Promise<void> {
    try {
      await this.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  async getVoiceHistory(): Promise<VoiceMessage[]> {
    try {
      const stored = await this.getItem(this.VOICE_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get voice history:', error);
      return [];
    }
  }

  async saveVoiceHistory(messages: VoiceMessage[]): Promise<void> {
    try {
      await this.setItem(this.VOICE_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save voice history:', error);
    }
  }

  async getSettings(): Promise<Settings> {
    try {
      const stored = await this.getItem(this.SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return {
        voiceEnabled: true,
        autoSpeak: true,
        speechRate: 0.9,
        speechPitch: 1.0,
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {
        voiceEnabled: true,
        autoSpeak: true,
        speechRate: 0.9,
        speechPitch: 1.0,
      };
    }
  }

  async saveSettings(settings: Settings): Promise<void> {
    try {
      await this.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async clearChatHistory(): Promise<void> {
    try {
      await this.deleteItem(this.CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  }

  async clearVoiceHistory(): Promise<void> {
    try {
      await this.deleteItem(this.VOICE_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear voice history:', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        this.clearChatHistory(),
        this.clearVoiceHistory(),
        this.deleteItem(this.SETTINGS_KEY),
      ]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
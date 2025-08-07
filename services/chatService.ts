export class ChatService {
  private apiKey: string = '';
  private baseUrl: string = 'https://api.openai.com/v1/chat/completions';

  async getAIResponse(message: string): Promise<string> {
    try {
      // For demo purposes, we'll simulate AI responses
      // In production, you'd integrate with OpenAI, Anthropic, or other AI APIs
      return await this.simulateAIResponse(message);
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw new Error('Failed to get AI response');
    }
  }

  private async simulateAIResponse(message: string): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = {
      greeting: [
        "Hello! I'm your AI English assistant. How can I help you practice today?",
        "Hi there! I'm here to help you improve your English. What would you like to talk about?",
        "Welcome! Let's practice English together. What's on your mind?",
      ],
      help: [
        "I can help you practice English conversation, improve pronunciation, and learn new vocabulary. Just start talking!",
        "You can ask me questions, practice conversations, or request help with specific English topics. I'm here to assist!",
        "I'm designed to help with English learning through natural conversation. Feel free to speak or type anything!",
      ],
      weather: [
        "That's a great topic for conversation! Weather talk is very common in English. Can you describe the weather where you are?",
        "Weather is a perfect conversation starter! Try using descriptive words like 'sunny', 'cloudy', 'rainy', or 'windy'.",
        "Talking about weather is great practice! You could say 'It's a beautiful day' or 'The weather is terrible today'.",
      ],
      pronunciation: [
        "Pronunciation practice is excellent! Try speaking slowly and clearly. I can help you with specific sounds or words.",
        "Great focus on pronunciation! Remember to practice the 'th' sound, 'r' and 'l' sounds, and word stress patterns.",
        "Pronunciation improves with practice! Try reading aloud and focus on connecting words smoothly in sentences.",
      ],
      default: [
        "That's interesting! Can you tell me more about that? I'd love to continue this conversation.",
        "Great point! How do you feel about that topic? Practice expressing your opinions in English.",
        "I understand. Can you explain that in different words? It's good practice to rephrase ideas.",
        "That's a good topic for discussion! What are your thoughts on this matter?",
        "Excellent! Try to expand on that idea. Use more descriptive words and detailed explanations.",
      ],
    };

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return this.getRandomResponse(responses.greeting);
    } else if (lowerMessage.includes('help') || lowerMessage.includes('practice')) {
      return this.getRandomResponse(responses.help);
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('sun')) {
      return this.getRandomResponse(responses.weather);
    } else if (lowerMessage.includes('pronunciation') || lowerMessage.includes('pronounce') || lowerMessage.includes('speak')) {
      return this.getRandomResponse(responses.pronunciation);
    } else {
      return this.getRandomResponse(responses.default);
    }
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Method for when you integrate with a real AI API
  private async callRealAI(message: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful English conversation partner. Help users practice English by engaging in natural conversation, correcting mistakes gently, and encouraging them to speak more.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export const chatService = new ChatService();
/**
 * EpicChat - Advanced AI Avatar Assistant
 * 
 * This application provides an interactive AI avatar assistant with media generation capabilities
 * that learns from user interactions and provides a personalized experience.
 */

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('EpicChat initialized');
    initializeApp();
});

// Main application state
const appState = {
    // User preferences
    preferences: {
        theme: 'light',
        avatarStyle: 'realistic',
        voice: 'female',
        showTimestamps: true,
        speechRecognition: true,
        notificationSounds: true,
        autoScroll: true,
        learningRate: 5
    },
    
    // Avatar state
    avatar: {
        name: 'Epic Tech',
        image: '/images/avatar/frame-005.jpg',
        personality: 'friendly',
        learningData: [],
        mediaGenerationSkills: ['image', 'audio', 'video', 'code', 'chart']
    },
    
    // Chat history
    chatHistory: [],
    
    // Current media being generated
    currentMedia: {
        type: null,
        content: null,
        prompt: null
    },
    
    // Speech recognition state
    speechRecognition: {
        isListening: false,
        recognition: null
    },
    
    // UI state
    ui: {
        isTyping: false,
        activeModal: null,
        mediaOptionsVisible: false
    }
};

/**
 * Initialize the application
 */
function initializeApp() {
    // Load saved preferences and chat history
    loadSavedData();
    
    // Apply current theme
    applyTheme(appState.preferences.theme);
    
    // Initialize speech recognition
    initializeSpeechRecognition();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-resize textarea
    setupTextareaAutoResize();
    
    // Apply avatar
    updateAvatarDisplay();
}

/**
 * Load saved preferences and chat history from localStorage
 */
function loadSavedData() {
    try {
        // Load preferences
        const savedPreferences = localStorage.getItem('epicchat-preferences');
        if (savedPreferences) {
            appState.preferences = { ...appState.preferences, ...JSON.parse(savedPreferences) };
        }
        
        // Load chat history
        const savedChatHistory = localStorage.getItem('epicchat-chat-history');
        if (savedChatHistory) {
            appState.chatHistory = JSON.parse(savedChatHistory);
            
            // Display chat history (limited to last 20 messages)
            const recentMessages = appState.chatHistory.slice(-20);
            recentMessages.forEach(message => {
                addMessageToChat(message.content, message.sender, message.timestamp, false);
            });
        }
        
        // Load avatar data
        const savedAvatar = localStorage.getItem('epicchat-avatar');
        if (savedAvatar) {
            appState.avatar = { ...appState.avatar, ...JSON.parse(savedAvatar) };
        }
        
        // Load learning data
        const savedLearningData = localStorage.getItem('epicchat-learning-data');
        if (savedLearningData) {
            appState.avatar.learningData = JSON.parse(savedLearningData);
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
        // Continue with default values if there's an error
    }
}

/**
 * Save current state to localStorage
 */
function saveAppState() {
    try {
        localStorage.setItem('epicchat-preferences', JSON.stringify(appState.preferences));
        localStorage.setItem('epicchat-chat-history', JSON.stringify(appState.chatHistory));
        localStorage.setItem('epicchat-avatar', JSON.stringify({
            name: appState.avatar.name,
            image: appState.avatar.image,
            personality: appState.avatar.personality
        }));
        localStorage.setItem('epicchat-learning-data', JSON.stringify(appState.avatar.learningData));
    } catch (error) {
        console.error('Error saving app state:', error);
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Send button
    const sendButton = document.getElementById('send-button');
    sendButton.addEventListener('click', handleSendMessage);
    
    // User input (Enter key)
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });
    
    // Microphone button
    const micButton = document.getElementById('mic-button');
    micButton.addEventListener('click', toggleSpeechRecognition);
    
    // Attachment button (media options)
    const attachmentButton = document.getElementById('attachment-button');
    attachmentButton.addEventListener('click', toggleMediaOptions);
    
    // Media options
    const mediaOptions = document.querySelectorAll('.media-option');
    mediaOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            const mediaType = event.currentTarget.getAttribute('data-type');
            promptForMediaGeneration(mediaType);
        });
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Export button
    const exportButton = document.getElementById('export-button');
    exportButton.addEventListener('click', showExportModal);
    
    // Preferences button
    const preferencesButton = document.getElementById('preferences-button');
    preferencesButton.addEventListener('click', () => showModal('preferences-modal'));
    
    // Customize avatar button
    const customizeAvatarButton = document.getElementById('customize-avatar');
    customizeAvatarButton.addEventListener('click', () => showModal('avatar-modal'));
    
    // Modal close buttons
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => hideModal(button.closest('.modal').id));
    });
    
    // Save preferences button
    const savePreferencesButton = document.getElementById('save-preferences-button');
    savePreferencesButton.addEventListener('click', savePreferences);
    
    // Reset preferences button
    const resetPreferencesButton = document.getElementById('reset-preferences-button');
    resetPreferencesButton.addEventListener('click', resetPreferences);
    
    // Save avatar button
    const saveAvatarButton = document.getElementById('save-avatar-button');
    saveAvatarButton.addEventListener('click', saveAvatarChanges);
    
    // Cancel avatar button
    const cancelAvatarButton = document.getElementById('cancel-avatar-button');
    cancelAvatarButton.addEventListener('click', () => hideModal('avatar-modal'));
    
    // Avatar options
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            // Remove selected class from all options
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            event.currentTarget.classList.add('selected');
        });
    });
    
    // Export options
    const exportOptions = document.querySelectorAll('.export-option-button');
    exportOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            const format = event.currentTarget.getAttribute('data-format');
            exportChat(format);
            hideModal('export-modal');
        });
    });
    
    // Media preview close button
    const mediaPreviewCloseButton = document.getElementById('media-preview-close');
    mediaPreviewCloseButton.addEventListener('click', hideMediaPreview);
    
    // Media preview download button
    const mediaPreviewDownloadButton = document.getElementById('media-preview-download');
    mediaPreviewDownloadButton.addEventListener('click', downloadGeneratedMedia);
    
    // Media preview regenerate button
    const mediaPreviewRegenerateButton = document.getElementById('media-preview-regenerate');
    mediaPreviewRegenerateButton.addEventListener('click', regenerateMedia);
    
    // Click outside modals to close
    window.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                hideModal(modal.id);
            }
        });
        
        // Close media options if clicking outside
        const mediaOptionsElement = document.getElementById('media-options');
        if (appState.ui.mediaOptionsVisible && 
            event.target !== mediaOptionsElement && 
            event.target !== attachmentButton &&
            !mediaOptionsElement.contains(event.target)) {
            toggleMediaOptions();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
}

/**
 * Set up textarea auto-resize
 */
function setupTextareaAutoResize() {
    const textarea = document.getElementById('user-input');
    
    textarea.addEventListener('input', function() {
        // Reset height to auto to get the correct scrollHeight
        this.style.height = 'auto';
        
        // Set new height based on scrollHeight (with max height limit)
        const newHeight = Math.min(this.scrollHeight, 150);
        this.style.height = newHeight + 'px';
    });
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Adjust UI elements based on window size
    const avatarSection = document.querySelector('.avatar-section');
    const chatSection = document.querySelector('.chat-section');
    
    if (window.innerWidth <= 768) {
        // Mobile layout adjustments
    } else if (window.innerWidth <= 1024) {
        // Tablet layout adjustments
    } else {
        // Desktop layout adjustments
    }
}

/**
 * Handle sending a message
 */
function handleSendMessage() {
    const userInput = document.getElementById('user-input');
    const messageText = userInput.value.trim();
    
    if (messageText === '') return;
    
    // Add user message to chat
    addMessageToChat(messageText, 'user');
    
    // Clear input field
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Process user message and generate response
    processUserMessage(messageText);
}

/**
 * Process user message and generate AI response
 * @param {string} message - The user's message
 */
function processUserMessage(message) {
    // Show typing indicator
    showTypingIndicator();
    
    // Check if this is a media generation request
    const mediaType = detectMediaRequest(message);
    
    if (mediaType) {
        // Handle media generation request
        generateMedia(mediaType, message);
    } else {
        // Learn from user input
        learnFromUserInput(message);
        
        // Generate AI response with a slight delay to simulate thinking
        setTimeout(() => {
            const response = generateAIResponse(message);
            
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add AI response to chat
            addMessageToChat(response, 'bot');
        }, 1500);
    }
}

/**
 * Detect if a message is requesting media generation
 * @param {string} message - The user's message
 * @returns {string|null} - The detected media type or null
 */
function detectMediaRequest(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for explicit media generation requests
    if (lowerMessage.includes('generate image') || lowerMessage.includes('create image') || lowerMessage.includes('make an image')) {
        return 'image';
    } else if (lowerMessage.includes('generate audio') || lowerMessage.includes('create audio') || lowerMessage.includes('make audio')) {
        return 'audio';
    } else if (lowerMessage.includes('generate video') || lowerMessage.includes('create video') || lowerMessage.includes('make a video')) {
        return 'video';
    } else if (lowerMessage.includes('generate code') || lowerMessage.includes('write code') || lowerMessage.includes('create code')) {
        return 'code';
    } else if (lowerMessage.includes('generate chart') || lowerMessage.includes('create chart') || lowerMessage.includes('make a chart')) {
        return 'chart';
    }
    
    return null;
}

/**
 * Prompt user for media generation
 * @param {string} mediaType - The type of media to generate
 */
function promptForMediaGeneration(mediaType) {
    // Hide media options
    toggleMediaOptions();
    
    // Set placeholder text based on media type
    const userInput = document.getElementById('user-input');
    let placeholder;
    
    switch (mediaType) {
        case 'image':
            placeholder = 'Describe the image you want to generate...';
            break;
        case 'audio':
            placeholder = 'Describe the audio you want to generate...';
            break;
        case 'video':
            placeholder = 'Describe the video you want to generate...';
            break;
        case 'code':
            placeholder = 'Describe the code you want to generate...';
            break;
        case 'chart':
            placeholder = 'Describe the chart you want to generate...';
            break;
        default:
            placeholder = 'Type your message...';
    }
    
    userInput.placeholder = placeholder;
    userInput.focus();
    
    // Add a suggestion message from the bot
    const mediaNames = {
        'image': 'an image',
        'audio': 'an audio clip',
        'video': 'a video',
        'code': 'code',
        'chart': 'a chart'
    };
    
    const suggestionMessage = `I'll help you generate ${mediaNames[mediaType]}. Please describe what you want in detail.`;
    addMessageToChat(suggestionMessage, 'bot');
}

/**
 * Generate media based on user prompt
 * @param {string} mediaType - The type of media to generate
 * @param {string} prompt - The user's prompt for generation
 */
function generateMedia(mediaType, prompt) {
    // Store current media request
    appState.currentMedia = {
        type: mediaType,
        prompt: prompt,
        content: null
    };
    
    // Generate response message
    let responseMessage;
    switch (mediaType) {
        case 'image':
            responseMessage = "I'm generating an image based on your description. This will take just a moment...";
            break;
        case 'audio':
            responseMessage = "I'm creating an audio clip based on your request. This will take just a moment...";
            break;
        case 'video':
            responseMessage = "I'm producing a video based on your description. This might take a little longer...";
            break;
        case 'code':
            responseMessage = "I'm writing code based on your requirements. This will take just a moment...";
            break;
        case 'chart':
            responseMessage = "I'm creating a chart based on your specifications. This will take just a moment...";
            break;
        default:
            responseMessage = "I'm working on your request. This will take just a moment...";
    }
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Add response message to chat
    addMessageToChat(responseMessage, 'bot');
    
    // Simulate media generation with a delay
    setTimeout(() => {
        const generatedMedia = simulateMediaGeneration(mediaType, prompt);
        
        // Store generated media
        appState.currentMedia.content = generatedMedia;
        
        // Show the generated media
        displayGeneratedMedia(mediaType, generatedMedia);
        
        // Add completion message
        let completionMessage;
        switch (mediaType) {
            case 'image':
                completionMessage = "I've generated an image based on your description. What do you think?";
                break;
            case 'audio':
                completionMessage = "I've created an audio clip based on your request. What do you think?";
                break;
            case 'video':
                completionMessage = "I've produced a video based on your description. What do you think?";
                break;
            case 'code':
                completionMessage = "I've written code based on your requirements. Let me know if you need any adjustments.";
                break;
            case 'chart':
                completionMessage = "I've created a chart based on your specifications. What do you think?";
                break;
            default:
                completionMessage = "I've completed your request. What do you think?";
        }
        
        addMessageToChat(completionMessage, 'bot');
    }, 3000);
}

/**
 * Simulate media generation (in a real app, this would call an AI service)
 * @param {string} mediaType - The type of media to generate
 * @param {string} prompt - The user's prompt
 * @returns {string} - URL or content of the generated media
 */
function simulateMediaGeneration(mediaType, prompt) {
    // In a real implementation, this would call an AI service API
    // For this demo, we'll return placeholder content
    
    switch (mediaType) {
        case 'image':
            // Return a random image from Unsplash based on keywords in the prompt
            const keywords = extractKeywords(prompt);
            return `https://source.unsplash.com/random/800x600?${keywords.join(',')}`;
        
        case 'audio':
            // In a real app, this would generate audio
            // For demo, return a placeholder audio URL
            return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        
        case 'video':
            // In a real app, this would generate video
            // For demo, return a placeholder video URL
            return 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
        
        case 'code':
            // Generate simple code based on the prompt
            return generateCodeSample(prompt);
        
        case 'chart':
            // Generate a chart image URL
            // In a real app, this would create a custom chart
            return 'https://quickchart.io/chart?c={type:%27bar%27,data:{labels:[%27January%27,%27February%27,%27March%27,%27April%27,%27May%27],datasets:[{label:%27Users%27,data:[50,60,70,180,190]}]}}';
        
        default:
            return '';
    }
}

/**
 * Extract keywords from a prompt for image generation
 * @param {string} prompt - The user's prompt
 * @returns {string[]} - Array of keywords
 */
function extractKeywords(prompt) {
    // Remove common words and extract key terms
    const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'of', 'generate', 'create', 'make', 'please', 'would', 'like', 'want', 'image', 'picture', 'photo', 'showing'];
    
    const words = prompt.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const filteredWords = words.filter(word => !commonWords.includes(word) && word.length > 2);
    
    // Return up to 5 keywords
    return filteredWords.slice(0, 5);
}

/**
 * Generate a code sample based on the prompt
 * @param {string} prompt - The user's prompt
 * @returns {string} - Generated code
 */
function generateCodeSample(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Simple logic to generate different code samples based on keywords
    if (lowerPrompt.includes('javascript') || lowerPrompt.includes('js')) {
        return `// JavaScript function based on your request
function processData(data) {
  // Validate input
  if (!data || !Array.isArray(data)) {
    throw new Error('Invalid input: data must be an array');
  }
  
  // Process the data
  const results = data.map(item => {
    return {
      id: item.id,
      value: item.value * 2,
      processed: true,
      timestamp: new Date().toISOString()
    };
  });
  
  // Filter out any invalid results
  return results.filter(item => item.value > 0);
}

// Example usage
const sampleData = [
  { id: 1, value: 10 },
  { id: 2, value: 5 },
  { id: 3, value: 0 }
];

const processedData = processData(sampleData);
console.log(processedData);`;
    } else if (lowerPrompt.includes('python')) {
        return `# Python function based on your request
import datetime

def process_data(data):
    """
    Process a list of data items.
    
    Args:
        data (list): List of dictionaries containing id and value
        
    Returns:
        list: Processed data with additional fields
    """
    if not isinstance(data, list):
        raise ValueError("Invalid input: data must be a list")
    
    results = []
    for item in data:
        if 'id' in item and 'value' in item:
            processed_item = {
                'id': item['id'],
                'value': item['value'] * 2,
                'processed': True,
                'timestamp': datetime.datetime.now().isoformat()
            }
            if processed_item['value'] > 0:
                results.append(processed_item)
    
    return results

# Example usage
sample_data = [
    {'id': 1, 'value': 10},
    {'id': 2, 'value': 5},
    {'id': 3, 'value': 0}
]

processed_data = process_data(sample_data)
print(processed_data)`;
    } else if (lowerPrompt.includes('html') || lowerPrompt.includes('css')) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Card Component</title>
    <style>
        /* Modern CSS Reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fa;
            padding: 20px;
        }
        
        .card-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .card {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            width: 300px;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .card-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .card-content {
            padding: 20px;
        }
        
        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #2d3748;
        }
        
        .card-description {
            color: #718096;
            margin-bottom: 15px;
        }
        
        .card-button {
            display: inline-block;
            background-color: #4299e1;
            color: white;
            padding: 8px 16px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s ease;
        }
        
        .card-button:hover {
            background-color: #3182ce;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .card {
                width: 100%;
                max-width: 400px;
            }
        }
    </style>
</head>
<body>
    <div class="card-container">
        <div class="card">
            <img src="https://source.unsplash.com/random/300x200?nature" alt="Card image" class="card-image">
            <div class="card-content">
                <h2 class="card-title">Nature Exploration</h2>
                <p class="card-description">Discover the beauty of natural landscapes and wildlife in this immersive experience.</p>
                <a href="#" class="card-button">Learn More</a>
            </div>
        </div>
        
        <div class="card">
            <img src="https://source.unsplash.com/random/300x200?technology" alt="Card image" class="card-image">
            <div class="card-content">
                <h2 class="card-title">Tech Innovation</h2>
                <p class="card-description">Explore the latest technological advancements shaping our future.</p>
                <a href="#" class="card-button">Learn More</a>
            </div>
        </div>
        
        <div class="card">
            <img src="https://source.unsplash.com/random/300x200?art" alt="Card image" class="card-image">
            <div class="card-content">
                <h2 class="card-title">Creative Arts</h2>
                <p class="card-description">Immerse yourself in the world of creativity and artistic expression.</p>
                <a href="#" class="card-button">Learn More</a>
            </div>
        </div>
    </div>
</body>
</html>`;
    } else {
        // Default to a simple JavaScript example
        return `// Generated code sample
function analyzeData(data) {
  const summary = {
    count: data.length,
    sum: data.reduce((acc, val) => acc + val, 0),
    average: 0,
    min: Math.min(...data),
    max: Math.max(...data)
  };
  
  summary.average = summary.sum / summary.count;
  
  return summary;
}

// Example usage
const numbers = [12, 5, 8, 23, 17, 9];
const analysis = analyzeData(numbers);
console.log(analysis);`;
    }
}

/**
 * Display generated media in the UI
 * @param {string} mediaType - The type of media
 * @param {string} mediaContent - The URL or content of the media
 */
function displayGeneratedMedia(mediaType, mediaContent) {
    const mediaPreview = document.getElementById('media-preview');
    const mediaPreviewContent = document.querySelector('.media-preview-content');
    const mediaPreviewImage = document.getElementById('media-preview-image');
    
    // Clear previous content
    mediaPreviewContent.innerHTML = '';
    
    // Create appropriate element based on media type
    switch (mediaType) {
        case 'image':
            const img = document.createElement('img');
            img.src = mediaContent;
            img.alt = 'Generated Image';
            img.className = 'media-preview-image';
            mediaPreviewContent.appendChild(img);
            break;
            
        case 'audio':
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = mediaContent;
            mediaPreviewContent.appendChild(audio);
            break;
            
        case 'video':
            const video = document.createElement('video');
            video.controls = true;
            video.src = mediaContent;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '300px';
            mediaPreviewContent.appendChild(video);
            break;
            
        case 'code':
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = mediaContent;
            pre.appendChild(code);
            pre.style.maxHeight = '300px';
            pre.style.overflow = 'auto';
            pre.style.width = '100%';
            pre.style.textAlign = 'left';
            mediaPreviewContent.appendChild(pre);
            break;
            
        case 'chart':
            const chartImg = document.createElement('img');
            chartImg.src = mediaContent;
            chartImg.alt = 'Generated Chart';
            chartImg.className = 'media-preview-image';
            mediaPreviewContent.appendChild(chartImg);
            break;
            
        default:
            const div = document.createElement('div');
            div.textContent = 'Media preview not available';
            mediaPreviewContent.appendChild(div);
    }
    
    // Show the media preview
    mediaPreview.classList.add('active');
}

/**
 * Hide the media preview
 */
function hideMediaPreview() {
    const mediaPreview = document.getElementById('media-preview');
    mediaPreview.classList.remove('active');
}

/**
 * Download the generated media
 */
function downloadGeneratedMedia() {
    if (!appState.currentMedia.content) return;
    
    const { type, content } = appState.currentMedia;
    
    switch (type) {
        case 'image':
        case 'chart':
            // For images and charts, create a download link
            const link = document.createElement('a');
            link.href = content;
            link.download = `generated-${type}-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            break;
            
        case 'audio':
            // For audio, open in new tab (browser will handle download)
            window.open(content, '_blank');
            break;
            
        case 'video':
            // For video, open in new tab (browser will handle download)
            window.open(content, '_blank');
            break;
            
        case 'code':
            // For code, create a text file
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `generated-code-${Date.now()}.txt`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            break;
    }
}

/**
 * Regenerate media with the same prompt
 */
function regenerateMedia() {
    if (!appState.currentMedia.prompt || !appState.currentMedia.type) return;
    
    const { type, prompt } = appState.currentMedia;
    
    // Hide current preview
    hideMediaPreview();
    
    // Add message about regeneration
    addMessageToChat(`I'll regenerate the ${type} with some variations.`, 'bot');
    
    // Regenerate with a delay
    setTimeout(() => {
        const newMedia = simulateMediaGeneration(type, prompt);
        
        // Update current media
        appState.currentMedia.content = newMedia;
        
        // Show the new media
        displayGeneratedMedia(type, newMedia);
        
        // Add completion message
        addMessageToChat(`I've regenerated the ${type}. Is this more what you had in mind?`, 'bot');
    }, 2000);
}

/**
 * Generate AI response to user message
 * @param {string} userMessage - The user's message
 * @returns {string} - The AI's response
 */
function generateAIResponse(userMessage) {
    // In a real implementation, this would call an AI service API
    // For this demo, we'll use simple pattern matching
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return `Hello! How can I help you today? I can generate images, audio, video, code, or charts. Just let me know what you'd like to create.`;
    }
    
    // Check for questions about capabilities
    if (lowerMessage.includes('what can you do') || lowerMessage.includes('your capabilities') || lowerMessage.includes('help me')) {
        return `I'm ${appState.avatar.name}, your AI assistant. I can generate various types of media including images, audio clips, videos, code samples, and data visualizations. I can also answer questions and learn from our interactions to provide a more personalized experience. What would you like to create today?`;
    }
    
    // Check for questions about the avatar
    if (lowerMessage.includes('who are you') || lowerMessage.includes('your name')) {
        return `I'm ${appState.avatar.name}, an AI avatar assistant designed to help you generate media and answer questions. I'm constantly learning from our interactions to better assist you.`;
    }
    
    // Check for thanks
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return `You're welcome! Is there anything else you'd like me to help you with?`;
    }
    
    // Default responses based on detected intent
    if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('photo')) {
        return `I'd be happy to generate an image for you. Please describe what you'd like to see in detail, or click the "+" button and select "Generate Image".`;
    }
    
    if (lowerMessage.includes('audio') || lowerMessage.includes('sound') || lowerMessage.includes('music')) {
        return `I can create audio for you. Please describe what kind of audio you'd like, or click the "+" button and select "Generate Audio".`;
    }
    
    if (lowerMessage.includes('video')) {
        return `I can generate video content for you. Please describe what you'd like to see in the video, or click the "+" button and select "Generate Video".`;
    }
    
    if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('script')) {
        return `I'd be happy to write some code for you. Please describe what functionality you need or what problem you're trying to solve, or click the "+" button and select "Generate Code".`;
    }
    
    if (lowerMessage.includes('chart') || lowerMessage.includes('graph') || lowerMessage.includes('visualization')) {
        return `I can create data visualizations for you. Please describe what data you'd like to visualize and what type of chart would be most appropriate, or click the "+" button and select "Generate Chart".`;
    }
    
    // Generic response for other queries
    return `I understand you're interested in "${userMessage.substring(0, 30)}${userMessage.length > 30 ? '...' : ''}". Would you like me to generate some media related to this topic? I can create images, audio, video, code, or charts. Just let me know what you prefer.`;
}

/**
 * Learn from user input to improve future responses
 * @param {string} userInput - The user's message
 */
function learnFromUserInput(userInput) {
    // In a real implementation, this would update a machine learning model
    // For this demo, we'll just store the input in the learning data array
    
    // Extract keywords and sentiment
    const keywords = extractKeywords(userInput);
    const sentiment = analyzeSentiment(userInput);
    
    // Create a learning data point
    const learningData = {
        input: userInput,
        keywords: keywords,
        sentiment: sentiment,
        timestamp: new Date().toISOString()
    };
    
    // Add to learning data array (limited to last 100 entries)
    appState.avatar.learningData.push(learningData);
    if (appState.avatar.learningData.length > 100) {
        appState.avatar.learningData.shift();
    }
    
    // Save learning data
    saveAppState();
    
    // Simulate learning by updating avatar status briefly
    const avatarContainer = document.querySelector('.avatar-container');
    const avatarStatus = document.querySelector('.avatar-status');
    
    avatarContainer.classList.add('avatar-talking');
    avatarStatus.style.opacity = '1';
    avatarStatus.style.transform = 'translateY(0)';
    
    // Reset after a delay
    setTimeout(() => {
        avatarContainer.classList.remove('avatar-talking');
        avatarStatus.style.opacity = '';
        avatarStatus.style.transform = '';
    }, 3000);
}

/**
 * Simple sentiment analysis of text
 * @param {string} text - The text to analyze
 * @returns {string} - The sentiment (positive, negative, or neutral)
 */
function analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love', 'like', 'happy', 'thanks', 'thank', 'beautiful', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'hate', 'dislike', 'sad', 'angry', 'upset', 'disappointed', 'worst', 'sucks', 'wrong'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Count occurrences of positive and negative words
    positiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            positiveCount += matches.length;
        }
    });
    
    negativeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            negativeCount += matches.length;
        }
    });
    
    // Determine sentiment based on counts
    if (positiveCount > negativeCount) {
        return 'positive';
    } else if (negativeCount > positiveCount) {
        return 'negative';
    } else {
        return 'neutral';
    }
}

/**
 * Add a message to the chat
 * @param {string} message - The message content
 * @param {string} sender - The sender ('user' or 'bot')
 * @param {string} timestamp - Optional timestamp (defaults to current time)
 * @param {boolean} save - Whether to save the message to history (default: true)
 */
function addMessageToChat(message, sender, timestamp = null, save = true) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    
    // Set message classes
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    
    // Add animation class
    messageElement.classList.add(sender === 'user' ? 'slide-in-right' : 'slide-in-left');
    
    // Set message content
    messageElement.innerHTML = `<p>${formatMessageContent(message)}</p>`;
    
    // Add timestamp if enabled
    if (appState.preferences.showTimestamps) {
        const timestampElement = document.createElement('div');
        timestampElement.classList.add('message-timestamp');
        timestampElement.textContent = timestamp || new Date().toLocaleTimeString();
        messageElement.appendChild(timestampElement);
    }
    
    // Add to chat
    chatMessages.appendChild(messageElement);
    
    // Auto-scroll to bottom if enabled
    if (appState.preferences.autoScroll) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Save to chat history if specified
    if (save) {
        const messageData = {
            content: message,
            sender: sender,
            timestamp: timestamp || new Date().toLocaleTimeString()
        };
        
        appState.chatHistory.push(messageData);
        
        // Limit chat history to last 100 messages
        if (appState.chatHistory.length > 100) {
            appState.chatHistory.shift();
        }
        
        // Save to localStorage
        saveAppState();
    }
    
    // Play notification sound if enabled and it's a bot message
    if (appState.preferences.notificationSounds && sender === 'bot') {
        playNotificationSound();
    }
}

/**
 * Format message content with special formatting (code, links, etc.)
 * @param {string} content - The raw message content
 * @returns {string} - Formatted HTML content
 */
function formatMessageContent(content) {
    let formattedContent = content;
    
    // Convert URLs to clickable links
    formattedContent = formattedContent.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Format code blocks (text between backticks)
    formattedContent = formattedContent.replace(
        /`([^`]+)`/g, 
        '<code>$1</code>'
    );
    
    // Format bold text (text between asterisks)
    formattedContent = formattedContent.replace(
        /\*\*([^*]+)\*\*/g, 
        '<strong>$1</strong>'
    );
    
    // Format italic text (text between underscores)
    formattedContent = formattedContent.replace(
        /\_([^_]+)\_/g, 
        '<em>$1</em>'
    );
    
    return formattedContent;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    // Check if typing indicator already exists
    if (document.querySelector('.typing-indicator')) {
        return;
    }
    
    // Set typing state
    appState.ui.isTyping = true;
    
    // Create typing indicator
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    
    // Add to chat
    chatMessages.appendChild(typingIndicator);
    
    // Auto-scroll to bottom if enabled
    if (appState.preferences.autoScroll) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Make avatar appear to be talking
    const avatarContainer = document.querySelector('.avatar-container');
    avatarContainer.classList.add('avatar-talking');
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    // Set typing state
    appState.ui.isTyping = false;
    
    // Remove typing indicator
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    // Stop avatar talking animation
    const avatarContainer = document.querySelector('.avatar-container');
    avatarContainer.classList.remove('avatar-talking');
}

/**
 * Toggle media options visibility
 */
function toggleMediaOptions() {
    const mediaOptions = document.getElementById('media-options');
    
    if (appState.ui.mediaOptionsVisible) {
        mediaOptions.classList.remove('active');
    } else {
        mediaOptions.classList.add('active');
    }
    
    appState.ui.mediaOptionsVisible = !appState.ui.mediaOptionsVisible;
}

/**
 * Initialize speech recognition
 */
function initializeSpeechRecognition() {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech recognition not supported in this browser');
        return;
    }
    
    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    appState.speechRecognition.recognition = new SpeechRecognition();
    
    // Configure speech recognition
    appState.speechRecognition.recognition.continuous = false;
    appState.speechRecognition.recognition.interimResults = false;
    appState.speechRecognition.recognition.lang = 'en-US';
    
    // Set up event handlers
    appState.speechRecognition.recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const userInput = document.getElementById('user-input');
        userInput.value = transcript;
        
        // Stop listening
        toggleSpeechRecognition();
        
        // Send message after a short delay
        setTimeout(() => {
            handleSendMessage();
        }, 500);
    };
    
    appState.speechRecognition.recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        toggleSpeechRecognition();
    };
    
    appState.speechRecognition.recognition.onend = function() {
        // If still in listening state but recognition ended, restart it
        if (appState.speechRecognition.isListening) {
            appState.speechRecognition.recognition.start();
        }
    };
}

/**
 * Toggle speech recognition on/off
 */
function toggleSpeechRecognition() {
    // Check if speech recognition is supported
    if (!appState.speechRecognition.recognition) {
        addMessageToChat('Speech recognition is not supported in your browser.', 'bot');
        return;
    }
    
    const micButton = document.getElementById('mic-button');
    
    if (appState.speechRecognition.isListening) {
        // Stop listening
        appState.speechRecognition.isListening = false;
        appState.speechRecognition.recognition.stop();
        micButton.classList.remove('active');
    } else {
        // Start listening
        try {
            appState.speechRecognition.isListening = true;
            appState.speechRecognition.recognition.start();
            micButton.classList.add('active');
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            appState.speechRecognition.isListening = false;
            micButton.classList.remove('active');
        }
    }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = appState.preferences.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Update preference
    appState.preferences.theme = newTheme;
    
    // Apply theme
    applyTheme(newTheme);
    
    // Save preferences
    saveAppState();
    
    // Update theme toggle icon
    updateThemeToggleIcon(newTheme);
}

/**
 * Apply theme to the document
 * @param {string} theme - The theme to apply ('light' or 'dark')
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#121212' : '#6C63FF');
    }
}

/**
 * Update theme toggle icon based on current theme
 * @param {string} theme - The current theme
 */
function updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

/**
 * Show a modal
 * @param {string} modalId - The ID of the modal to show
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Hide any currently open modal
    if (appState.ui.activeModal) {
        hideModal(appState.ui.activeModal);
    }
    
    // Show the modal
    modal.classList.remove('hidden');
    
    // Set as active modal
    appState.ui.activeModal = modalId;
    
    // If it's the preferences modal, update form values
    if (modalId === 'preferences-modal') {
        updatePreferencesForm();
    }
    
    // If it's the avatar modal, update form values
    if (modalId === 'avatar-modal') {
        updateAvatarForm();
    }
}

/**
 * Hide a modal
 * @param {string} modalId - The ID of the modal to hide
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Hide the modal
    modal.classList.add('hidden');
    
    // Clear active modal if it's the one being hidden
    if (appState.ui.activeModal === modalId) {
        appState.ui.activeModal = null;
    }
}

/**
 * Update preferences form with current values
 */
function updatePreferencesForm() {
    const { preferences } = appState;
    
    // Update form fields
    document.getElementById('theme-preference').value = preferences.theme;
    document.getElementById('avatar-style').value = preferences.avatarStyle || 'realistic';
    document.getElementById('voice-preference').value = preferences.voice;
    document.getElementById('timestamps-preference').checked = preferences.showTimestamps;
    document.getElementById('speech-recognition-preference').checked = preferences.speechRecognition;
    document.getElementById('notification-sounds-preference').checked = preferences.notificationSounds;
    document.getElementById('auto-scroll-preference').checked = preferences.autoScroll;
    document.getElementById('learning-rate').value = preferences.learningRate;
}

/**
 * Update avatar form with current values
 */
function updateAvatarForm() {
    const { avatar } = appState;
    
    // Update avatar name field
    document.getElementById('avatar-name-field').value = avatar.name;
    
    // Select the current avatar in the gallery
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-avatar') === avatar.image) {
            option.classList.add('selected');
        }
    });
}

/**
 * Save preferences from form
 */
function savePreferences() {
    // Get values from form
    const theme = document.getElementById('theme-preference').value;
    const avatarStyle = document.getElementById('avatar-style').value;
    const voice = document.getElementById('voice-preference').value;
    const showTimestamps = document.getElementById('timestamps-preference').checked;
    const speechRecognition = document.getElementById('speech-recognition-preference').checked;
    const notificationSounds = document.getElementById('notification-sounds-preference').checked;
    const autoScroll = document.getElementById('auto-scroll-preference').checked;
    const learningRate = document.getElementById('learning-rate').value;
    
    // Update preferences
    appState.preferences = {
        ...appState.preferences,
        theme,
        avatarStyle,
        voice,
        showTimestamps,
        speechRecognition,
        notificationSounds,
        autoScroll,
        learningRate
    };
    
    // Apply theme
    applyTheme(theme);
    
    // Update theme toggle icon
    updateThemeToggleIcon(theme);
    
    // Save preferences
    saveAppState();
    
    // Hide modal
    hideModal('preferences-modal');
    
    // Show confirmation message
    addMessageToChat('Your preferences have been updated.', 'bot');
}

/**
 * Reset preferences to defaults
 */
function resetPreferences() {
    // Default preferences
    const defaultPreferences = {
        theme: 'light',
        avatarStyle: 'realistic',
        voice: 'female',
        showTimestamps: true,
        speechRecognition: true,
        notificationSounds: true,
        autoScroll: true,
        learningRate: 5
    };
    
    // Update preferences
    appState.preferences = { ...defaultPreferences };
    
    // Apply theme
    applyTheme(defaultPreferences.theme);
    
    // Update theme toggle icon
    updateThemeToggleIcon(defaultPreferences.theme);
    
    // Update form values
    updatePreferencesForm();
    
    // Save preferences
    saveAppState();
}

/**
 * Save avatar changes from form
 */
function saveAvatarChanges() {
    // Get values from form
    const name = document.getElementById('avatar-name-field').value;
    
    // Get selected avatar image
    const selectedAvatar = document.querySelector('.avatar-option.selected');
    const image = selectedAvatar ? selectedAvatar.getAttribute('data-avatar') : appState.avatar.image;
    
    // Update avatar
    appState.avatar.name = name;
    appState.avatar.image = image;
    
    // Update avatar display
    updateAvatarDisplay();
    
    // Save avatar data
    saveAppState();
    
    // Hide modal
    hideModal('avatar-modal');
    
    // Show confirmation message
    addMessageToChat(`I've updated my appearance. You can call me ${name} now.`, 'bot');
}

/**
 * Update avatar display with current settings
 */
function updateAvatarDisplay() {
    // Update avatar image
    const avatarImage = document.getElementById('avatar-image');
    avatarImage.src = appState.avatar.image;
    
    // Update avatar name
    const avatarName = document.querySelector('.avatar-name');
    avatarName.textContent = appState.avatar.name;
}

/**
 * Show export modal
 */
function showExportModal() {
    showModal('export-modal');
}

/**
 * Export chat history in the specified format
 * @param {string} format - The export format ('text', 'html', 'json', or 'markdown')
 */
function exportChat(format) {
    // Get chat history
    const { chatHistory } = appState;
    
    if (chatHistory.length === 0) {
        addMessageToChat('There is no chat history to export.', 'bot');
        return;
    }
    
    let content;
    let filename;
    let mimeType;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    
    switch (format) {
        case 'html':
            content = exportAsHTML(chatHistory);
            filename = `epicchat-export-${timestamp}.html`;
            mimeType = 'text/html';
            break;
            
        case 'json':
            content = JSON.stringify({
                timestamp: new Date().toISOString(),
                avatar: appState.avatar.name,
                messages: chatHistory
            }, null, 2);
            filename = `epicchat-export-${timestamp}.json`;
            mimeType = 'application/json';
            break;
            
        case 'markdown':
            content = exportAsMarkdown(chatHistory);
            filename = `epicchat-export-${timestamp}.md`;
            mimeType = 'text/markdown';
            break;
            
        case 'text':
        default:
            content = exportAsText(chatHistory);
            filename = `epicchat-export-${timestamp}.txt`;
            mimeType = 'text/plain';
            break;
    }
    
    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show confirmation message
    addMessageToChat(`Your chat history has been exported as ${format.toUpperCase()}.`, 'bot');
}

/**
 * Export chat history as plain text
 * @param {Array} chatHistory - The chat history array
 * @returns {string} - Formatted text content
 */
function exportAsText(chatHistory) {
    let text = `EpicChat Conversation with ${appState.avatar.name}\n`;
    text += `Exported on ${new Date().toLocaleString()}\n\n`;
    
    chatHistory.forEach(message => {
        const sender = message.sender === 'user' ? 'You' : appState.avatar.name;
        text += `[${message.timestamp}] ${sender}: ${message.content}\n\n`;
    });
    
    return text;
}

/**
 * Export chat history as HTML
 * @param {Array} chatHistory - The chat history array
 * @returns {string} - Formatted HTML content
 */
function exportAsHTML(chatHistory) {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EpicChat Conversation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #6C63FF;
            text-align: center;
            border-bottom: 2px solid #6C63FF;
            padding-bottom: 10px;
        }
        .export-info {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .message {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 10px;
        }
        .user {
            background-color: #F0F7FF;
            margin-left: 50px;
        }
        .bot {
            background-color: #F5F5F7;
            margin-right: 50px;
        }
        .timestamp {
            font-size: 0.8rem;
            color: #888;
            text-align: right;
            margin-top: 5px;
        }
        .sender {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .user .sender {
            color: #2980b9;
        }
        .bot .sender {
            color: #6C63FF;
        }
    </style>
</head>
<body>
    <h1>EpicChat Conversation</h1>
    <div class="export-info">
        Conversation with ${appState.avatar.name}<br>
        Exported on ${new Date().toLocaleString()}
    </div>`;
    
    chatHistory.forEach(message => {
        const sender = message.sender === 'user' ? 'You' : appState.avatar.name;
        const cssClass = message.sender === 'user' ? 'user' : 'bot';
        
        html += `
    <div class="message ${cssClass}">
        <div class="sender">${sender}</div>
        <div class="content">${formatMessageContent(message.content)}</div>
        <div class="timestamp">${message.timestamp}</div>
    </div>`;
    });
    
    html += `
</body>
</html>`;
    
    return html;
}

/**
 * Export chat history as Markdown
 * @param {Array} chatHistory - The chat history array
 * @returns {string} - Formatted Markdown content
 */
function exportAsMarkdown(chatHistory) {
    let markdown = `# EpicChat Conversation with ${appState.avatar.name}\n\n`;
    markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
    
    chatHistory.forEach(message => {
        const sender = message.sender === 'user' ? 'You' : appState.avatar.name;
        markdown += `### ${sender} (${message.timestamp})\n\n${message.content}\n\n---\n\n`;
    });
    
    return markdown;
}

/**
 * Play notification sound
 */
function playNotificationSound() {
    // Create audio element
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-2573.mp3');
    audio.volume = 0.5;
    
    // Play sound
    audio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
    });
}
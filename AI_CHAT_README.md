# AI Chat System Integration

## Overview
Complete AI-based chat system with image generation, editing, and conversation management. This system integrates with the existing Lacey app and provides a comprehensive chat interface with the following features:

- **Text Chat**: Regular text conversations with AI
- **Image Generation**: Generate images from text prompts using AI
- **Image Editing**: Edit existing images with text instructions
- **Image Upload**: Upload and edit your own images
- **Conversation Management**: Create, view, and manage multiple conversations
- **Real-time Updates**: Live message updates and status indicators

## Features

### 🎨 Image Generation
- Generate images from text descriptions
- High-quality AI-generated images
- Support for various art styles and concepts
- Image metadata and compression

### ✏️ Image Editing
- Edit generated images with text instructions
- Maintain conversation history with previous versions
- Visual comparison between original and edited images

### 📤 Image Upload
- Upload images from gallery or camera
- Edit uploaded images with AI
- Support for PNG, JPG, WEBP formats
- File size validation and optimization

### 💬 Conversation Management
- Create multiple conversations
- View conversation history
- Delete or clear conversations
- Conversation statistics and analytics
- Pagination for large conversation lists

## Components Structure

```
components/chat/
├── ChatInterface.tsx          # Main chat interface
├── MessageBubble.tsx          # Individual message display
├── ImageUploadModal.tsx       # Image upload and editing modal
└── ConversationList.tsx       # List of all conversations

services/
└── chatApi.ts                 # API service for all chat endpoints

types/
└── chat.ts                    # TypeScript interfaces

utils/
└── validation.ts              # Form validation utilities
```

## API Integration

### Base Configuration
The system uses the existing API configuration from `constants/api.ts`:
```typescript
export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://10.0.2.2:5000`;
```

### Available Endpoints
- `POST /api/chat/conversations` - Create new conversation
- `POST /api/chat/conversations/{id}/messages` - Send message
- `POST /api/chat/conversations/{id}/messages/upload` - Upload and edit image
- `GET /api/chat/conversations/{id}/details` - Get conversation details
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/conversations/stats` - Get statistics
- `POST /api/chat/conversations/{id}/clear` - Clear conversation
- `DELETE /api/chat/conversations/{id}` - Delete conversation

## Usage

### 1. Starting a New Conversation
```typescript
// The ConversationList component handles this automatically
// Users can tap "New Conversation" to create a new chat
```

### 2. Sending Messages
```typescript
// Text messages
sendMessage("Hello, how are you?", "text");

// Image generation
sendMessage("A beautiful sunset over mountains", "image_generation");
```

### 3. Uploading and Editing Images
```typescript
// The ImageUploadModal handles this
// Users can select from gallery or camera
// Then provide editing instructions
```

### 4. Managing Conversations
```typescript
// View all conversations
<ConversationList 
  onConversationSelect={handleSelect}
  onCreateNewConversation={handleCreate}
/>

// Chat in specific conversation
<ChatInterface 
  conversationId={conversationId}
  onConversationUpdate={handleUpdate}
/>
```

## Message Types

### Text Messages
- Regular chat messages
- Simple text input and display
- Timestamp and user identification

### Image Generation
- Generate images from text prompts
- Display generated images with metadata
- Support for various image sizes and formats

### Image Editing
- Edit existing images with text instructions
- Show before/after comparison
- Maintain conversation history

### Image Upload
- Upload user images
- Edit uploaded images with AI
- Support for multiple image formats

## Validation and Error Handling

### Input Validation
- Message length limits (500 characters)
- Image generation prompt minimum length (10 characters)
- File size limits (10MB maximum)
- Required field validation

### Error Handling
- Network error handling
- API error responses
- User-friendly error messages
- Retry mechanisms for failed requests

## UI/UX Features

### Modern Design
- Clean, intuitive interface
- Consistent color scheme with app theme
- Responsive design for different screen sizes
- Smooth animations and transitions

### User Experience
- Real-time message updates
- Loading states and progress indicators
- Image preview and zoom functionality
- Pull-to-refresh for conversation lists
- Infinite scroll for large conversation lists

### Accessibility
- Screen reader support
- High contrast mode support
- Touch-friendly interface elements
- Keyboard navigation support

## Integration with Existing App

### Navigation
- Integrated with existing `BottomNavbar`
- Uses existing `Header` component
- Maintains app navigation structure
- URL parameter support for deep linking

### Styling
- Consistent with app theme colors
- Uses existing design patterns
- Responsive layout system
- Dark/light mode support

### State Management
- Local state management with React hooks
- Conversation state persistence
- Real-time updates
- Error state handling

## Dependencies Added

```json
{
  "expo-image-picker": "^15.0.7"
}
```

## File Structure

```
app/
└── chat.tsx                   # Main chat screen (updated)

components/chat/
├── ChatInterface.tsx          # Main chat interface
├── MessageBubble.tsx           # Message display component
├── ImageUploadModal.tsx       # Image upload modal
└── ConversationList.tsx       # Conversation list

services/
└── chatApi.ts                 # API service

types/
└── chat.ts                    # TypeScript interfaces

utils/
└── validation.ts               # Validation utilities
```

## Testing

### Manual Testing
1. Create new conversation
2. Send text messages
3. Generate images from text
4. Upload and edit images
5. Navigate between conversations
6. Test error scenarios

### API Testing
- Use provided Postman collection
- Test all endpoints with various inputs
- Verify error handling
- Test file upload functionality

## Future Enhancements

### Planned Features
- Voice message support
- Real-time typing indicators
- Message search functionality
- Conversation sharing
- Advanced image editing tools
- Batch image operations

### Performance Optimizations
- Image caching and compression
- Lazy loading for large conversations
- Background message processing
- Offline message queuing

## Troubleshooting

### Common Issues
1. **API Connection**: Verify API_URL in constants/api.ts
2. **Image Upload**: Check file permissions and size limits
3. **Navigation**: Ensure proper route configuration
4. **Styling**: Verify theme consistency

### Debug Mode
- Enable console logging for API calls
- Use React Native debugger
- Check network requests in developer tools
- Verify image loading and display

## Support

For issues or questions:
1. Check the API documentation
2. Verify network connectivity
3. Check console for error messages
4. Test with different input types
5. Verify image file formats and sizes

## License

This AI Chat system is part of the Lacey app and follows the same licensing terms.

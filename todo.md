# Groq Chatbot Project TODO

## Database & Schema
- [x] Create conversations table to store chat sessions
- [x] Create messages table to store individual messages with user/assistant roles
- [x] Add database migration SQL and apply schema

## Backend (tRPC Procedures)
- [x] Create chat.sendMessage procedure to handle user messages and LLM responses
- [x] Create chat.getHistory procedure to fetch conversation history
- [x] Create chat.resetConversation procedure to clear chat history
- [x] Implement LLM integration with invokeLLM function
- [x] Add system prompt for helpful assistant behavior
- [x] Implement context window limiting (last 10 messages)

## Frontend UI Components
- [x] Create ChatBox component with message display area
- [x] Implement message bubbles with distinct styling for user vs AI messages
- [x] Build typing indicator animation component
- [x] Create auto-resizing textarea input component
- [x] Add "New Chat" / Reset button with confirmation
- [x] Implement keyboard shortcuts (Enter to send, Shift+Enter for newline)

## Styling & Theme
- [x] Apply dark theme with #FF00FF background color
- [x] Use #10a37f accent color for interactive elements and AI message bubbles
- [x] Implement modern isometric aesthetic with floating geometric planes
- [x] Add translucent colors (teal, blue, coral) for visual depth
- [x] Create subtle grid texture background
- [x] Use bold heavy sans-serif typography for focal points
- [x] Ensure smooth scrolling to latest message

## LLM & Markdown
- [x] Integrate Streamdown component for markdown rendering
- [x] Test markdown rendering with various AI response formats
- [x] Verify LLM responses are properly formatted and streamed

## Testing
- [x] Write vitest tests for chat.sendMessage procedure
- [x] Write vitest tests for chat.getHistory procedure
- [x] Write vitest tests for chat.resetConversation procedure
- [x] Test keyboard shortcuts functionality
- [x] Test typing indicator display and removal
- [x] Test auto-resize textarea behavior

## Integration & Polish
- [x] Test full chat flow end-to-end
- [x] Verify conversation history persistence
- [x] Test context window limiting with multiple messages
- [x] Ensure responsive design across devices
- [x] Test error handling and edge cases

## Deployment & Delivery
- [x] Create checkpoint for completed project
- [x] Verify all features working correctly
- [x] Deliver to user with documentation

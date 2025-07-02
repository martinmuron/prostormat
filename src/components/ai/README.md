# AI Integration Components

This directory will contain AI-powered UI components for the Prostormat platform.

## Planned Components

### 1. VenueDescriptionGenerator
- AI-powered venue description generation
- Integration with venue creation/editing forms
- Real-time suggestions based on venue details

### 2. EventSuggestionsPanel
- Smart suggestions for event requirements
- Integration with event request forms
- Context-aware recommendations

### 3. SmartSearchSuggestions
- Intelligent search query suggestions
- Auto-complete with AI enhancement
- Search optimization hints

### 4. AIAssistant (Future)
- Chat-based venue recommendations
- Natural language venue search
- Personalized suggestions

## Usage Examples

```tsx
// Venue description generation
import { VenueDescriptionGenerator } from '@/components/ai/VenueDescriptionGenerator';

<VenueDescriptionGenerator
  venueData={{ name: "My Venue", address: "Prague 1", capacity: 100 }}
  onGenerate={(description) => setDescription(description)}
/>

// Event suggestions
import { EventSuggestionsPanel } from '@/components/ai/EventSuggestionsPanel';

<EventSuggestionsPanel
  eventData={{ title: "Corporate Event", type: "business" }}
  onSuggestion={(suggestions) => setSuggestions(suggestions)}
/>
```

## Configuration

The AI features are powered by Claude Sonnet 4 via the Anthropic API. Configuration is handled in `/src/lib/ai.ts`.

Environment variables required:
- `ANTHROPIC_API_KEY`: Your Claude API key

## API Endpoints

- `/api/ai/generate-description` - Generate venue descriptions
- `/api/ai/event-suggestions` - Generate event requirements suggestions  
- `/api/ai/search-suggestions` - Generate search query suggestions

## Future Enhancements

1. **Image Analysis**: AI-powered venue photo analysis and tagging
2. **Smart Matching**: Intelligent venue-event matching algorithms
3. **Price Optimization**: AI-driven pricing suggestions for venues
4. **Review Analysis**: Sentiment analysis of venue reviews
5. **Chatbot Integration**: Full conversational AI assistant
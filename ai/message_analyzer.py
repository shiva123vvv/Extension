import logging
import re
from datetime import datetime
from typing import Dict, List, Optional
from collections import Counter

logger = logging.getLogger(__name__)

class MessageAnalyzer:
    def __init__(self):
        self.sentiment_keywords = {
            "positive": ["great", "awesome", "thanks", "good", "excellent", "perfect", "happy"],
            "negative": ["urgent", "problem", "issue", "error", "failed", "broken", "stress"],
            "stress": ["overwhelmed", "too much", "can't handle", "burnout", "exhausted"]
        }
        self.priority_indicators = ["asap", "urgent", "important", "critical", "emergency"]
        logger.info("Message analyzer initialized")

    async def analyze_message(self, message_text: str, metadata: Dict = None) -> Dict:
        """Analyze a single message for various indicators"""
        text_lower = message_text.lower()
        
        # Sentiment analysis
        sentiment = await self._analyze_sentiment(text_lower)
        
        # Priority detection
        priority_level = await self._detect_priority(text_lower)
        
        # Stress indicators
        stress_indicators = await self._detect_stress_indicators(text_lower)
        
        # Urgency detection
        urgency_score = await self._calculate_urgency(text_lower)
        
        # Topic extraction
        topics = await self._extract_topics(text_lower)
        
        return {
            "sentiment": sentiment,
            "priority_level": priority_level,
            "stress_indicators": stress_indicators,
            "urgency_score": urgency_score,
            "topics": topics,
            "message_length": len(message_text),
            "contains_questions": "?" in message_text,
            "contains_mentions": len(re.findall(r'@\w+', message_text)) > 0,
            "timestamp": datetime.now().isoformat()
        }

    async def analyze_message_batch(self, messages: List[Dict]) -> Dict:
        """Analyze a batch of messages for patterns"""
        if not messages:
            return {"analysis": {}, "patterns": []}
        
        all_analysis = []
        for msg in messages:
            analysis = await self.analyze_message(msg.get('text', ''), msg.get('metadata'))
            all_analysis.append(analysis)
        
        # Aggregate patterns
        patterns = await self._aggregate_patterns(all_analysis)
        
        return {
            "total_messages": len(messages),
            "average_sentiment": self._calculate_avg_sentiment(all_analysis),
            "common_topics": self._find_common_topics(all_analysis),
            "urgency_distribution": self._analyze_urgency_distribution(all_analysis),
            "stress_frequency": self._calculate_stress_frequency(all_analysis),
            "patterns": patterns,
            "timestamp": datetime.now().isoformat()
        }

    async def _analyze_sentiment(self, text: str) -> str:
        """Analyze message sentiment"""
        positive_count = sum(1 for word in self.sentiment_keywords["positive"] if word in text)
        negative_count = sum(1 for word in self.sentiment_keywords["negative"] if word in text)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

    async def _detect_priority(self, text: str) -> str:
        """Detect message priority level"""
        priority_words = [word for word in self.priority_indicators if word in text]
        
        if any(word in text for word in ["urgent", "critical", "emergency"]):
            return "high"
        elif any(word in text for word in ["important", "asap"]):
            return "medium"
        else:
            return "normal"

    async def _detect_stress_indicators(self, text: str) -> List[str]:
        """Detect stress indicators in message text"""
        return [word for word in self.sentiment_keywords["stress"] if word in text]

    async def _calculate_urgency(self, text: str) -> float:
        """Calculate urgency score for message"""
        urgency_indicators = {
            "asap": 0.9, "urgent": 0.8, "immediately": 0.7, "now": 0.6,
            "important": 0.5, "deadline": 0.4
        }
        
        score = 0.0
        for indicator, weight in urgency_indicators.items():
            if indicator in text:
                score = max(score, weight)
                
        return score

    async def _extract_topics(self, text: str) -> List[str]:
        """Extract main topics from message text"""
        common_topics = {
            "meeting": ["meeting", "call", "discuss"],
            "task": ["task", "work", "assignment", "todo"],
            "issue": ["problem", "issue", "error", "bug", "fix"],
            "question": ["question", "help", "advice", "suggest"],
            "update": ["update", "progress", "status", "report"]
        }
        
        topics = []
        for topic, keywords in common_topics.items():
            if any(keyword in text for keyword in keywords):
                topics.append(topic)
                
        return topics

    async def _aggregate_patterns(self, analysis_list: List[Dict]) -> List[Dict]:
        """Aggregate patterns from multiple message analyses"""
        if not analysis_list:
            return []
            
        patterns = []
        
        # Check for high urgency pattern
        high_urgency_count = sum(1 for analysis in analysis_list if analysis['urgency_score'] > 0.7)
        if high_urgency_count > len(analysis_list) * 0.3:  # 30% threshold
            patterns.append({
                "type": "HIGH_URGENCY_PATTERN",
                "description": f"High urgency in {high_urgency_count}/{len(analysis_list)} messages",
                "severity": "medium"
            })
        
        # Check for stress pattern
        stress_message_count = sum(1 for analysis in analysis_list if analysis['stress_indicators'])
        if stress_message_count > len(analysis_list) * 0.2:  # 20% threshold
            patterns.append({
                "type": "STRESS_PATTERN", 
                "description": f"Stress indicators in {stress_message_count}/{len(analysis_list)} messages",
                "severity": "high"
            })
            
        return patterns

    def _calculate_avg_sentiment(self, analysis_list: List[Dict]) -> Dict:
        """Calculate average sentiment distribution"""
        sentiment_count = Counter([analysis['sentiment'] for analysis in analysis_list])
        total = len(analysis_list)
        
        return {
            "positive": sentiment_count.get('positive', 0) / total if total > 0 else 0,
            "negative": sentiment_count.get('negative', 0) / total if total > 0 else 0,
            "neutral": sentiment_count.get('neutral', 0) / total if total > 0 else 0
        }

    def _find_common_topics(self, analysis_list: List[Dict]) -> List[Dict]:
        """Find most common topics across messages"""
        all_topics = []
        for analysis in analysis_list:
            all_topics.extend(analysis['topics'])
            
        topic_count = Counter(all_topics)
        return [{"topic": topic, "count": count} for topic, count in topic_count.most_common(5)]

    def _analyze_urgency_distribution(self, analysis_list: List[Dict]) -> Dict:
        """Analyze distribution of urgency levels"""
        urgency_levels = Counter([analysis['priority_level'] for analysis in analysis_list])
        total = len(analysis_list)
        
        return {
            "high": urgency_levels.get('high', 0) / total if total > 0 else 0,
            "medium": urgency_levels.get('medium', 0) / total if total > 0 else 0,
            "normal": urgency_levels.get('normal', 0) / total if total > 0 else 0
        }

    def _calculate_stress_frequency(self, analysis_list: List[Dict]) -> float:
        """Calculate frequency of stress indicators"""
        stress_messages = sum(1 for analysis in analysis_list if analysis['stress_indicators'])
        return stress_messages / len(analysis_list) if analysis_list else 0
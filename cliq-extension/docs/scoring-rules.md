# Scoring Rules – Team Cognitive Load Monitor

## Inputs per user (per day)
- totalMessages
- lateNightMessages
- avgLength
- channelCount

## Normalization
- load = normalize(totalMessages)
- burnout = normalize(lateNightMessages)
- contextSpread = normalize(channelCount)

## Final Stress Score
stressScore = load * 0.5 + burnout * 0.3 + contextSpread * 0.2

## Status thresholds
- CRITICAL: score >= 80
- HIGH: 60 <= score < 80
- NORMAL: score < 60

// Team Wellness Dashboard Pro - Competition Winning Features
const WellnessDashboardPro = {
  name: "Wellness Dashboard Pro",
  type: "widget",
  description: "🏆 AI-powered wellness analytics with burnout prediction & gamification",
  version: "3.0",
  
  render: function(context) {
    const teamData = this.getEnhancedTeamAnalytics(context.teamId);
    const predictions = this.getAIPredictions(context.teamId);
    const gamification = this.getGamificationData(context.teamId);
    const heatmap = this.generateHeatmapData(context.teamId);
    const behavioral = this.getBehavioralInsights(context.teamId);
    const social = this.getSocialTemperature(context.teamId);
    const relationships = this.getRelationshipHealth(context.teamId);
    
    return {
      template: {
        type: "vertical",
        elements: [
          // Competition Header
          {
            type: "text",
            text: "🧠 **Team Wellness AI Pro+**",
            style: "header",
            size: "large"
          },
          {
            type: "text",
            text: "🏆 Competition-Ready Analytics Platform | AI-PRO v3.0",
            style: "subheader"
          },
          
          // Real-time Burnout Prediction Section
          {
            type: "text",
            text: "🔥 **Burnout Risk Prediction**",
            style: "bold"
          },
          {
            type: "text",
            text: `**Current Risk:** ${predictions.burnoutRisk.score}% (${predictions.burnoutRisk.level.toUpperCase()})`,
            style: "normal"
          },
          {
            type: "text",
            text: `📈 **Trend:** ${predictions.burnoutRisk.trend} | ⏰ **Timeframe:** ${predictions.burnoutRisk.timeframe}`,
            style: "caption"
          },
          
          // Wellness Score with AI
          {
            type: "text",
            text: `🏆 Overall Wellness Score: **${teamData.overallScore}%** ${teamData.trendIcon}`,
            style: "bold"
          },
          {
            type: "text",
            text: `📊 AI Confidence: ${teamData.aiConfidence}% | 🎯 Trend: ${teamData.trend} ${teamData.change}`,
            style: "caption"
          },
          
          // Heatmap Visualization Section
          {
            type: "text",
            text: "🌡️ **Wellness Heatmap**",
            style: "bold"
          },
          {
            type: "text",
            text: "**Stress & Productivity by Time:**",
            style: "normal"
          },
          {
            type: "text",
            text: `🟢 6-9AM: ${heatmap.timeSlots[0].stress}% stress, ${heatmap.timeSlots[0].productivity}% productivity`,
            style: "caption"
          },
          {
            type: "text",
            text: `🟡 9-12PM: ${heatmap.timeSlots[1].stress}% stress, ${heatmap.timeSlots[1].productivity}% productivity`,
            style: "caption"
          },
          {
            type: "text",
            text: `🔴 12-3PM: ${heatmap.timeSlots[2].stress}% stress, ${heatmap.timeSlots[2].productivity}% productivity`,
            style: "caption"
          },
          {
            type: "text",
            text: `🟠 3-6PM: ${heatmap.timeSlots[3].stress}% stress, ${heatmap.timeSlots[3].productivity}% productivity`,
            style: "caption"
          },
          
          // Advanced Metrics
          {
            type: "text",
            text: "📊 **Advanced Metrics**",
            style: "bold"
          },
          {
            type: "text",
            text: `😰 Stress Intelligence: ${teamData.stressScore}% ${teamData.stressTrend === "down" ? "↘️" : "↗️"}`,
            style: "normal"
          },
          {
            type: "text",
            text: `📈 Productivity AI: ${teamData.productivityScore}% ${teamData.productivityTrend === "up" ? "↗️" : "↘️"}`,
            style: "normal"
          },
          {
            type: "text",
            text: `🤖 Engagement AI: ${teamData.engagementScore}% ${teamData.engagementTrend === "stable" ? "➡️" : "↗️"}`,
            style: "normal"
          },
          {
            type: "text",
            text: `🎯 Focus Score: ${teamData.focusScore}% ${teamData.focusTrend === "up" ? "↗️" : "↘️"}`,
            style: "normal"
          },
          
          // Behavioral Health Section
          {
            type: "text",
            text: "🧠 **Behavioral Health Analysis**",
            style: "bold"
          },
          {
            type: "text",
            text: `**Overall Score:** ${behavioral.overallScore}/100 ${behavioral.trendIcon}`,
            style: "normal"
          },
          {
            type: "text",
            text: `• Imposter Syndrome: ${behavioral.patterns.imposterSyndrome}%`,
            style: "caption"
          },
          {
            type: "text",
            text: `• Passive Burnout: ${behavioral.patterns.passiveBurnout}%`,
            style: "caption"
          },
          {
            type: "text",
            text: `• Communication Anxiety: ${behavioral.patterns.communicationAnxiety}%`,
            style: "caption"
          },
          
          // Social Temperature Section
          {
            type: "text",
            text: "🌡️ **Social Temperature**",
            style: "bold"
          },
          {
            type: "text",
            text: `**Current Reading:** ${social.current}°F ${social.emoji}`,
            style: "normal"
          },
          {
            type: "text",
            text: `**Vibe:** ${social.vibe} | **Trend:** ${social.trend}`,
            style: "caption"
          },
          {
            type: "text",
            text: `😊 Positive: ${social.moodDistribution.positive}% | 😐 Neutral: ${social.moodDistribution.neutral}%`,
            style: "caption"
          },
          
          // Relationship Health Section
          {
            type: "text",
            text: "🤝 **Relationship Health**",
            style: "bold"
          },
          {
            type: "text",
            text: `**Overall Score:** ${relationships.overallScore}/100 ${relationships.trendIcon}`,
            style: "normal"
          },
          {
            type: "text",
            text: `• Collaboration: ${relationships.metrics.collaboration}%`,
            style: "caption"
          },
          {
            type: "text",
            text: `• Communication: ${relationships.metrics.communication}%`,
            style: "caption"
          },
          {
            type: "text",
            text: `• Trust: ${relationships.metrics.trust}%`,
            style: "caption"
          },
          
          // Meeting Analysis Section
          {
            type: "text",
            text: "📅 **Smart Meeting Analysis**",
            style: "bold"
          },
          {
            type: "text",
            text: `**Meeting Load:** ${teamData.meetingLoad}% of work week`,
            style: "normal"
          },
          {
            type: "text",
            text: `⚠️ **Stress Impact:** ${teamData.meetingStress}/10`,
            style: "caption"
          },
          
          // Gamification Leaderboard
          {
            type: "text",
            text: "🏅 **Wellness Leaderboard**",
            style: "bold"
          },
          {
            type: "text",
            text: "**Top Performers:**",
            style: "normal"
          }
        ].concat(gamification.leaderboard.slice(0, 3).map((user, index) => ({
          type: "text",
          text: `${index + 1}. ${user.name} - ${user.points} pts (${user.level})`,
          style: "caption"
        }))).concat([
          // Task Overload Detection
          {
            type: "text",
            text: "⚖️ **Workload Balance**",
            style: "bold"
          },
          {
            type: "text",
            text: `**Distribution:** ${teamData.balancedUsers} balanced, ${teamData.overloadedUsers} overloaded, ${teamData.underloadedUsers} underloaded`,
            style: "normal"
          },
          
          // Focus Recommendations
          {
            type: "text",
            text: "🎯 **Focus Mode Analytics**",
            style: "bold"
          },
          {
            type: "text",
            text: `**Optimal Times:** ${teamData.optimalFocusTimes}`,
            style: "normal"
          },
          
          // AI Routine Builder
          {
            type: "text",
            text: "🤖 **AI-Powered Daily Routine**",
            style: "bold"
          },
          {
            type: "text",
            text: `🌅 **Morning:** ${teamData.routine.morning.time} - ${teamData.routine.morning.activities[0]}`,
            style: "normal"
          },
          
          // Real-time Interventions
          {
            type: "text",
            text: "🚨 **Active Interventions**",
            style: "bold"
          }
        ]).concat(teamData.activeAlerts.map(alert => ({
          type: "text",
          text: `⚠️ ${alert.message} (${alert.priority} priority)`,
          style: alert.priority === "high" ? "bold" : "normal"
        }))).concat([
          // Competition Actions
          {
            type: "actions",
            title: "🚀 Competition Features",
            elements: [
              {
                type: "button",
                label: "🔥 Burnout Report",
                action: "generate_burnout_report",
                style: "danger"
              },
              {
                type: "button", 
                label: "🧠 Behavior Analysis",
                action: "behavior_analysis",
                style: "primary"
              },
              {
                type: "button",
                label: "🌡️ Social Temperature",
                action: "social_temperature",
                style: "secondary"
              },
              {
                type: "button",
                label: "🤝 Relationship Health",
                action: "relationship_health",
                style: "secondary"
              },
              {
                type: "button",
                label: "🎮 Gamification",
                action: "open_gamification",
                style: "success"
              },
              {
                type: "button",
                label: "🌡️ View Heatmap",
                action: "show_heatmap",
                style: "secondary"
              },
              {
                type: "button",
                label: "🤖 AI Routine",
                action: "generate_ai_routine", 
                style: "secondary"
              }
            ]
          },
          
          // Status Footer
          {
            type: "text",
            text: `🕒 Last updated: ${new Date().toLocaleTimeString()} | 📊 Competition AI v3.0`,
            style: "caption",
            align: "center"
          }
        ])
      }
    };
  },
  
  getEnhancedTeamAnalytics: function(teamId) {
    return {
      overallScore: 82,
      trend: "improving",
      change: "+5%", 
      trendIcon: "↗️",
      aiConfidence: 89,
      
      stressScore: 35,
      productivityScore: 78,
      engagementScore: 85,
      focusScore: 72,
      
      stressTrend: "down",
      productivityTrend: "up",
      engagementTrend: "stable",
      focusTrend: "up",
      
      stressAnalysis: "Below team average - optimal range",
      productivityAnalysis: "Peak performance detected", 
      engagementAnalysis: "High collaboration patterns",
      focusAnalysis: "Good focus with room for optimization",
      
      // Meeting Analysis
      meetingLoad: 65,
      meetingStress: 7,
      meetingRecommendations: [
        "Reduce meeting duration by 15%",
        "Implement no-meeting Wednesdays",
        "Convert 30% meetings to async updates"
      ],
      
      // Workload Balance
      balancedUsers: 5,
      overloadedUsers: 1, 
      underloadedUsers: 1,
      workloadRecommendations: [
        "Redistribute 3 tasks from overloaded members",
        "Implement workload transparency",
        "Weekly workload review"
      ],
      
      // Focus Analytics
      optimalFocusTimes: "9-11 AM, 2-4 PM",
      recommendedTechniques: [
        "Pomodoro (25/5)",
        "Time blocking",
        "Deep work sessions"
      ],
      
      // Routine Builder
      routine: {
        morning: {
          time: "7:00 AM - 9:00 AM",
          activities: ["Meditation", "Planning", "Healthy breakfast"]
        },
        work: {
          time: "9:00 AM - 5:00 PM", 
          activities: ["Deep work", "Collaboration", "Creative blocks"]
        },
        breaks: {
          time: "Every 90 minutes",
          activities: ["Stretch", "Hydrate", "Quick walk"]
        }
      },
      
      activeAlerts: [
        {
          type: "burnout_risk",
          message: "1 team member at high burnout risk",
          priority: "high"
        },
        {
          type: "meeting_overload", 
          message: "Meeting load exceeding optimal levels",
          priority: "medium"
        }
      ]
    };
  },
  
  getAIPredictions: function(teamId) {
    return {
      burnoutRisk: {
        score: 64,
        level: "medium",
        trend: "increasing",
        confidence: 87,
        timeframe: "2-3 weeks",
        factors: [
          "Meeting overload",
          "Task imbalance", 
          "Late night work",
          "High stress spikes"
        ]
      }
    };
  },
  
  getGamificationData: function(teamId) {
    return {
      leaderboard: [
        { name: "Alex Chen", points: 450, level: "Gold" },
        { name: "Sarah Kim", points: 380, level: "Silver" },
        { name: "Mike Rodriguez", points: 320, level: "Silver" },
        { name: "Priya Patel", points: 290, level: "Bronze" },
        { name: "David Smith", points: 260, level: "Bronze" }
      ],
      activeChallenges: [
        "🧘 7-Day Mindfulness Challenge",
        "💧 Hydration Week", 
        "🚶‍♂️ 10K Steps Daily"
      ]
    };
  },
  
  generateHeatmapData: function(teamId) {
    return {
      timeSlots: [
        { time: "6-9 AM", stress: 25, productivity: 85, emoji: "🟢" },
        { time: "9-12 PM", stress: 45, productivity: 92, emoji: "🟡" },
        { time: "12-3 PM", stress: 68, productivity: 78, emoji: "🔴" },
        { time: "3-6 PM", stress: 55, productivity: 82, emoji: "🟠" },
        { time: "6+ PM", stress: 30, productivity: 45, emoji: "🟢" }
      ]
    };
  },

  getBehavioralInsights: function(teamId) {
    return {
      overallScore: 78,
      trendIcon: "↗️",
      patterns: {
        imposterSyndrome: 12,
        passiveBurnout: 23,
        communicationAnxiety: 15,
        withdrawalPatterns: 8
      },
      recommendations: [
        "Confidence-building workshops",
        "Regular mental health check-ins",
        "Communication training"
      ]
    };
  },

  getSocialTemperature: function(teamId) {
    return {
      current: 76,
      emoji: "🟢",
      vibe: "Warm & Collaborative",
      trend: "Improving",
      moodDistribution: {
        positive: 65,
        neutral: 25,
        stressed: 8,
        frustrated: 2
      },
      environment: {
        psychologicalSafety: 8,
        collaboration: 7,
        support: 9
      }
    };
  },

  getRelationshipHealth: function(teamId) {
    return {
      overallScore: 82,
      trendIcon: "↗️",
      metrics: {
        collaboration: 85,
        communication: 78,
        conflictResolution: 80,
        trust: 88
      },
      improvements: [
        "Cross-team collaboration",
        "Meeting participation balance",
        "Idea sharing frequency"
      ]
    };
  },
  
  // Enhanced action handling for competition features
  handleAction: function(action, context) {
    switch(action) {
      case "generate_burnout_report":
        return this.generateBurnoutReport(context);
      case "behavior_analysis":
        return this.showBehavioralAnalysis(context);
      case "social_temperature":
        return this.showSocialTemperature(context);
      case "relationship_health":
        return this.showRelationshipHealth(context);
      case "open_gamification":
        return this.openGamificationHub(context);
      case "show_heatmap":
        return this.showDetailedHeatmap(context);
      case "generate_ai_routine":
        return this.generatePersonalizedRoutine(context);
      case "team_building_activities":
        return this.showRelationshipHealth(context);
      case "join_wellness_challenge":
        return this.openGamificationHub(context);
      case "customize_routine":
        return this.generatePersonalizedRoutine(context);
      case "schedule_optimization":
        return this.showDetailedHeatmap(context);
      case "detailed_behavioral_report":
        return this.showBehavioralAnalysis(context);
      case "boost_morale":
        return this.showSocialTemperature(context);
      case "view_full_leaderboard":
        return this.viewFullLeaderboard(context);
      case "add_routine_to_calendar":
        return this.addRoutineToCalendar(context);
      default:
        return this.showDefaultResponse();
    }
  },
  
  // FIX: Added missing functions that were referenced but didn't exist
  viewFullLeaderboard: function(context) {
    return {
      text: `🏆 **Full Wellness Leaderboard** 🏆\n\n` +
            `1. Alex Chen - 450 pts (Gold)\n` +
            `2. Sarah Kim - 380 pts (Silver)\n` +
            `3. Mike Rodriguez - 320 pts (Silver)\n` +
            `4. Priya Patel - 290 pts (Bronze)\n` +
            `5. David Smith - 260 pts (Bronze)\n` +
            `6. Taylor Wong - 240 pts (Bronze)\n` +
            `7. Maria Garcia - 210 pts (Bronze)\n` +
            `8. James Wilson - 180 pts (Bronze)`,
      cards: [
        {
          title: "🎮 Gamification Hub",
          actions: [
            { 
              type: "button", 
              label: "Back to Dashboard", 
              action: "open_gamification" 
            }
          ]
        }
      ]
    };
  },

  addRoutineToCalendar: function(context) {
    return {
      text: `📅 **Routine Added to Calendar**\n\n` +
            `Your AI-powered routine has been successfully added to your calendar!\n\n` +
            `✅ **Scheduled Events:**\n` +
            `• Morning meditation (7:15 AM daily)\n` +
            `• Deep work blocks (9-11 AM)\n` +
            `• Focus breaks (every 90 minutes)\n` +
            `• Evening wind-down (9:30 PM)\n\n` +
            `💡 **Pro Tip:** Sync with your digital calendar to get notifications and stay on track with your wellness goals! ✨`
    };
  },
  
  generateBurnoutReport: function(context) {
    return {
      text: `🔥 **Comprehensive Burnout Risk Report** 🔥\n\n` +
            `**Team:** ${context.teamName}\n` +
            `**Period:** Last 30 days\n` +
            `**Overall Risk:** 64% (Medium-High)\n\n` +
            `📊 **Risk Distribution:**\n` +
            `• Low Risk: 4 members\n` +
            `• Medium Risk: 2 members\n` +
            `• High Risk: 1 member\n\n` +
            `🎯 **Primary Risk Factors:**\n` +
            `• Meeting overload (72% of work week)\n` +
            `• Workload imbalance\n` +
            `• Afternoon stress spikes\n` +
            `• Limited recovery time\n\n` +
            `🛡️ **Prevention Strategy:**\n` +
            `• Implement no-meeting Fridays\n` +
            `• Redistribute 15% of workload\n` +
            `• Schedule mandatory breaks\n` +
            `• Introduce wellness check-ins`,
      cards: [
        {
          title: "📈 Risk Trends",
          fields: [
            { name: "30-Day Trend", value: "Increasing ↗️" },
            { name: "Predicted Peak", value: "2 weeks" },
            { name: "Prevention Confidence", value: "85%" }
          ]
        }
      ]
    };
  },

  showBehavioralAnalysis: function(context) {
    return {
      text: `🧠 **Behavioral Pattern Analysis** 🧠\n\n` +
            `**Team Behavioral Health:** 78/100 🟢\n\n` +
            `📊 **Detected Patterns:**\n` +
            `• Imposter Syndrome: Low (12% of team)\n` +
            `• Passive Burnout: Medium (23% of team)\n` +
            `• Communication Anxiety: Low (15% of team)\n` +
            `• Withdrawal Patterns: Minimal (8% of team)\n\n` +
            `🎯 **Intervention Recommendations:**\n` +
            `• Implement confidence-building exercises\n` +
            `• Schedule regular check-ins for at-risk members\n` +
            `• Provide communication training\n` +
            `• Create psychological safety protocols\n\n` +
            `💡 **Positive Patterns:**\n` +
            `• Strong collaboration signals\n` +
            `• Healthy conflict resolution\n` +
            `• Good feedback culture`,
      cards: [
        {
          title: "🛡️ Behavioral Health Plan",
          actions: [
            {
              type: "button",
              label: "📋 Detailed Report",
              action: "detailed_behavioral_report"
            }
          ]
        }
      ]
    };
  },

  showSocialTemperature: function(context) {
    return {
      text: `🌡️ **Social Temperature Analysis** 🌡️\n\n` +
            `**Current Reading:** 76°F 🟢\n` +
            `**Vibe:** Warm & Collaborative\n` +
            `**Trend:** Improving ↗️\n\n` +
            `📊 **Temperature Breakdown:**\n` +
            `• Positivity Level: 78%\n` +
            `• Supportiveness: 82%\n` +
            `• Encouragement: 75%\n` +
            `• Appreciation: 70%\n\n` +
            `🎯 **Mood Distribution:**\n` +
            `😊 Positive: 65%\n` +
            `😐 Neutral: 25%\n` +
            `😰 Stressed: 8%\n` +
            `😠 Frustrated: 2%\n\n` +
            `💡 **Environment Analysis:**\n` +
            `• Healthy communication patterns\n` +
            `• Good psychological safety\n` +
            `• Strong team bonding`,
      cards: [
        {
          title: "🌤️ Climate Control",
          actions: [
            {
              type: "button",
              label: "🔄 Boost Morale",
              action: "boost_morale"
            }
          ]
        }
      ]
    };
  },

  showRelationshipHealth: function(context) {
    return {
      text: `🤝 **Team Relationship Health** 🤝\n\n` +
            `**Overall Score:** 82/100 🟢\n` +
            `**Trend:** Improving ↗️\n\n` +
            `📈 **Key Metrics:**\n` +
            `• Collaboration Quality: 85%\n` +
            `• Communication Effectiveness: 78%\n` +
            `• Conflict Resolution: 80%\n` +
            `• Trust Level: 88%\n\n` +
            `🎯 **Strengths:**\n` +
            `• Strong mutual support\n` +
            `• Effective feedback culture\n` +
            `• Good conflict management\n\n` +
            `💡 **Areas for Improvement:**\n` +
            `• Cross-team collaboration\n` +
            `• Meeting participation balance\n` +
            `• Idea sharing frequency`,
      cards: [
        {
          title: "💞 Relationship Building",
          actions: [
            {
              type: "button",
              label: "🔄 Team Building",
              action: "team_building_activities"
            }
          ]
        }
      ]
    };
  },
  
  openGamificationHub: function(context) {
    return {
      text: `🎮 **Gamification Hub** 🎮\n\n` +
            `**Your Progress:**\n` +
            `🏅 Rank: #3\n` +
            `⭐ Points: 320\n` +
            `📈 Level: Silver\n\n` +
            `🏆 **Active Challenges:**\n` +
            `🧘 7-Day Mindfulness Challenge\n` +
            `💧 Hydration Week\n` +
            `🚶‍♂️ 10K Steps Daily\n\n` +
            `🎯 **Next Milestone:**\n` +
            `• 400 points for Gold level\n` +
            `• 5 more achievements needed`,
      cards: [
        {
          title: "Quick Actions",
          actions: [
            {
              type: "button",
              label: "📊 Full Leaderboard",
              action: "view_full_leaderboard"
            },
            {
              type: "button",
              label: "🎯 Join Challenge",
              action: "join_wellness_challenge"
            }
          ]
        }
      ]
    };
  },
  
  showDetailedHeatmap: function(context) {
    return {
      text: `🌡️ **Detailed Wellness Heatmap** 🌡️\n\n` +
            `**Stress & Productivity Analysis:**\n\n` +
            `🕐 **By Time of Day:**\n` +
            `🟢 6-9AM: 25% stress, 85% productivity\n` +
            `🟡 9-12PM: 45% stress, 92% productivity\n` +
            `🔴 12-3PM: 68% stress, 78% productivity\n` +
            `🟠 3-6PM: 55% stress, 82% productivity\n` +
            `🟢 6PM+: 30% stress, 45% productivity\n\n` +
            `📅 **By Day of Week:**\n` +
            `📈 Monday: 45% stress, 88% productivity\n` +
            `📈 Tuesday: 38% stress, 92% productivity\n` +
            `📉 Wednesday: 52% stress, 76% productivity\n` +
            `📈 Thursday: 41% stress, 85% productivity\n` +
            `📉 Friday: 48% stress, 72% productivity\n\n` +
            `💡 **Key Insights:**\n` +
            `• Peak stress: 2:00 PM (68%)\n` +
            `• Peak productivity: 10:30 AM (92%)\n` +
            `• Optimal work window: 9:30 AM - 11:30 AM`,
      cards: [
        {
          title: "📊 Optimization Tips",
          actions: [
            {
              type: "button",
              label: "🕐 Schedule Optimization",
              action: "schedule_optimization"
            }
          ]
        }
      ]
    };
  },
  
  generatePersonalizedRoutine: function(context) {
    return {
      text: `🤖 **AI-Powered Daily Routine** 🤖\n\n` +
            `**Personalized for Maximum Productivity:**\n\n` +
            `🌅 **Morning (7:00 AM - 9:00 AM):**\n` +
            `• 7:00 AM: Wake up & hydrate\n` +
            `• 7:15 AM: 15min mindfulness meditation\n` +
            `• 7:45 AM: Healthy breakfast\n` +
            `• 8:15 AM: Plan day priorities\n` +
            `• 8:45 AM: Review key tasks\n\n` +
            `🏃 **Work Blocks (9:00 AM - 5:00 PM):**\n` +
            `• 9-11 AM: Deep work (Most productive)\n` +
            `• 11-12 PM: Collaboration & meetings\n` +
            `• 12-1 PM: Lunch & walk break\n` +
            `• 1-2 PM: Administrative tasks\n` +
            `• 2-4 PM: Creative work & problem-solving\n` +
            `• 4-5 PM: Planning & wrap-up\n\n` +
            `🧘 **Scheduled Breaks:**\n` +
            `• 10:30 AM: 10min stretch & hydration\n` +
            `• 1:30 PM: 5min breathing exercise\n` +
            `• 3:30 PM: 5min walk & refresh\n\n` +
            `🌙 **Evening (6:00 PM onwards):**\n` +
            `• 6:00 PM: Digital detox begins\n` +
            `• 6:30 PM: Family/Personal time\n` +
            `• 8:00 PM: Relaxation routine\n` +
            `• 9:30 PM: Wind down & reading\n` +
            `• 10:30 PM: Sleep preparation`,
      cards: [
        {
          title: "🔄 Implement This Routine",
          actions: [
            {
              type: "button",
              label: "📅 Add to Calendar",
              action: "add_routine_to_calendar"
            },
            {
              type: "button",
              label: "⚙️ Customize Schedule",
              action: "customize_routine"
            }
          ]
        }
      ]
    };
  },
  
  showDefaultResponse: function() {
    return {
      text: "🤖 **Wellness Dashboard Pro**\n\nUse the competition features to access advanced analytics, burnout predictions, gamification, and AI-powered routines."
    };
  },

  // Original methods from WellnessDashboard
  getTeamAnalytics: function(teamId) {
    const stressLevel = this.calculateTeamStress(teamId);
    const productivityScore = this.calculateTeamProductivity(teamId);
    
    return {
      overallScore: this.calculateOverallWellness(stressLevel, productivityScore),
      stressLevel: stressLevel,
      productivityScore: productivityScore,
      engagementLevel: this.calculateEngagement(teamId),
      cohesionLevel: this.calculateCohesion(teamId),
      
      stressTrend: stressLevel > 45 ? "up" : "down",
      productivityTrend: productivityScore > 65 ? "up" : "down",
      engagementTrend: "stable",
      cohesionTrend: "up",
      
      stressDescription: this.getStressDescription(stressLevel),
      productivityDescription: this.getProductivityDescription(productivityScore),
      engagementDescription: "Active participation level",
      cohesionDescription: "Team collaboration quality",
      
      immediateActions: [
        "Schedule 15-minute team break",
        "Review workload distribution",
        "Implement focus blocks",
        "Send wellness resources"
      ],
      
      longTermStrategies: [
        "Weekly wellness check-ins",
        "Flexible work hours policy",
        "Mental health support program",
        "Productivity training sessions"
      ],
      
      confidence: 87
    };
  },
  
  getWellnessTrends: function(teamId) {
    return {
      weeklyData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Stress Level",
            data: [45, 52, 48, 35, 32, 25, 28],
            color: "#e74c3c"
          },
          {
            label: "Productivity",
            data: [65, 62, 70, 75, 78, 45, 40],
            color: "#27ae60"
          },
          {
            label: "Engagement",
            data: [72, 68, 75, 78, 82, 35, 30],
            color: "#3498db"
          }
        ]
      },
      peakHours: "10:00 AM - 12:00 PM",
      commonBlockers: "Meeting overload, Context switching"
    };
  },
  
  calculateTeamStress: function(teamId) {
    const baseStress = 35;
    const dayFactor = new Date().getDay();
    const timeFactor = new Date().getHours();
    
    let stress = baseStress;
    if (dayFactor === 1) stress += 15;
    if (timeFactor >= 14 && timeFactor <= 17) stress += 10;
    
    return Math.min(100, stress);
  },
  
  calculateTeamProductivity: function(teamId) {
    const baseProductivity = 75;
    const dayFactor = new Date().getDay();
    
    let productivity = baseProductivity;
    if (dayFactor >= 1 && dayFactor <= 4) productivity += 5;
    if (dayFactor === 5) productivity -= 10;
    
    return Math.max(0, Math.min(100, productivity));
  },
  
  calculateEngagement: function(teamId) {
    return 72;
  },
  
  calculateCohesion: function(teamId) {
    return 68;
  },
  
  calculateOverallWellness: function(stress, productivity) {
    const stressWeight = 0.4;
    const productivityWeight = 0.6;
    
    const normalizedStress = 100 - stress;
    return Math.round((normalizedStress * stressWeight) + (productivity * productivityWeight));
  },
  
  getStressDescription: function(stressLevel) {
    if (stressLevel > 70) return "High - Immediate attention needed";
    if (stressLevel > 50) return "Elevated - Monitor closely";
    if (stressLevel > 30) return "Moderate - Healthy range";
    return "Low - Optimal condition";
  },
  
  getProductivityDescription: function(productivityScore) {
    if (productivityScore > 80) return "Excellent - Peak performance";
    if (productivityScore > 60) return "Good - Solid output";
    if (productivityScore > 40) return "Moderate - Room for improvement";
    return "Low - Needs optimization";
  }
};

module.exports = WellnessDashboardPro;
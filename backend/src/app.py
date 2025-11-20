from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route('/cliqtrix/analyze', methods=['POST'])
def analyze_team():
    """Endpoint for CliqTrix slash command"""
    data = request.json
    
    # Your analysis logic here
    stress_level = calculate_stress(data['messages'])
    workload_imbalance = calculate_workload(data['messages'])
    
    # Return Cliq-compatible message card
    return jsonify({
        "text": "Team Cognitive Analysis",
        "cards": [
            {
                "name": "team_analysis_card",
                "style": "information",
                "title": "Team Health Report",
                "fields": [
                    {
                        "name": "Stress Level",
                        "value": f"{stress_level}%",
                        "type": "text"
                    },
                    {
                        "name": "Workload Imbalance", 
                        "value": f"{workload_imbalance}%",
                        "type": "text"
                    }
                ]
            }
        ]
    })

def calculate_stress(messages):
    # Your existing analysis logic
    return 65  # example

def calculate_workload(messages):
    # Your existing analysis logic  
    return 42  # example
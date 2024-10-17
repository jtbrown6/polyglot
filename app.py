from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import openai
import os
import json
from dotenv import load_dotenv
import logging
import re

load_dotenv()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set your OpenAI API key securely
openai.api_key = os.getenv('OPENAI_API_KEY')  # Ensure you have set this environment variable

# @app.route('/')
# def index():
#     return render_template('index.html')

# This handles the "Assist Me" Button
@app.route('/api/assist', methods=['POST'])
def assist():
    data = request.json
    text = data.get('text', '')
    messages = [
        {"role": "system", "content": "You are a helpful assistant proficient in correcting Spanish text. If there is a mistake related to missing accent marks, ignore them. The user does not have a keyboard to support the language perfectly."},
        {"role": "user", "content": f"Correct the following Spanish text and explain any mistakes:\n\n{text}"}
    ]
    response = openai.ChatCompletion.create(
        model='gpt-4o-mini',
        messages=messages,
        max_tokens=900,
        temperature=0.7,
    )
    return jsonify({'result': response.choices[0].message['content'].strip()})

# @app.route('/api/translate_to_spanish', methods=['POST'])
# def translate_to_spanish():
#     data = request.json
#     text = data.get('text', '')
#     messages = [
#         {"role": "system", "content": "You are a helpful assistant proficient in translating English to Spanish."},
#         {"role": "user", "content": f"Translate the following English text to Spanish, considering cultural context:\n\n{text}"}
#     ]
#     response = openai.ChatCompletion.create(
#         model='gpt-4o-mini',
#         messages=messages,
#         max_tokens=900,
#         temperature=0.7,
#     )
#     return jsonify({'result': response.choices[0].message['content'].strip()})

# @app.route('/api/translate_to_english', methods=['POST'])
# def translate_to_english():
#     data = request.json
#     text = data.get('text', '')
#     messages = [
#         {"role": "system", "content": "You are a helpful assistant proficient in translating Spanish to English."},
#         {"role": "user", "content": f"Translate the following Spanish text to English, considering cultural context:\n\n{text}"}
#     ]
#     response = openai.ChatCompletion.create(
#         model='gpt-4o-mini',
#         messages=messages,
#         max_tokens=900,
#         temperature=0.7,
#     )
#     return jsonify({'result': response.choices[0].message['content'].strip()})

# This handles the conjugate button and table
@app.route('/api/conjugate', methods=['POST'])
def conjugate():
    data = request.json
    verb = data.get('verb', '')
    logger.debug(f"Received request to conjugate verb: {verb}")
    
    messages = [
        {"role": "system", "content": "You are a helpful assistant proficient in Spanish verb conjugations."},
        {"role": "user", "content": f"Provide the conjugations of the Spanish verb '{verb}' in the following tenses: present, subjunctive, preterite, imperfect, and future. Do not include 'vosotros' forms. Return ONLY the JSON data with keys for each tense ('present', 'subjunctive', etc.), and for each tense, provide a dictionary with keys 'yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes', and their corresponding conjugations."}
    ]
    
    try:
        response = openai.ChatCompletion.create(
            model='gpt-4o-mini',
            messages=messages,
            max_tokens=700,
            temperature=0.7,
        )
        logger.debug(f"Received response from OpenAI: {response}")
        
        content = response.choices[0].message['content'].strip()
        logger.debug(f"Extracted content: {content}")
        
        # Extract JSON content
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            json_content = json_match.group(0)
            logger.debug(f"Extracted JSON content: {json_content}")
            
            conjugations = json.loads(json_content)
            logger.debug(f"Parsed conjugations: {conjugations}")
            
            return jsonify({'result': conjugations})
        else:
            logger.error("No JSON content found in the response")
            return jsonify({'error': 'No JSON content found in the response', 'raw_response': content})
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return jsonify({'error': 'Failed to parse conjugations', 'raw_response': content})
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)})


@app.route('/api/define', methods=['POST'])
def define():
    data = request.json
    word = data.get('word', '')
    messages = [
        {"role": "system", "content": "You are a helpful assistant proficient in defining Spanish words in English and vice versa."},
        {"role": "user", "content": f"Define the Spanish or English word '{word}' in English or Spanish and provide a sentence using the word. If the word has both a definition for its form as a noun or adjective provide both."}
    ]
    response = openai.ChatCompletion.create(
        model='gpt-4o-mini',
        messages=messages,
        max_tokens=200,
        temperature=0.7,
    )
    return jsonify({'result': response.choices[0].message['content'].strip()})

# Handles the Popup box Modal questions
@app.route('/api/question', methods=['POST'])
def question():
    data = request.json
    query = data.get('query', '')
    messages = [
        {"role": "system", "content": "You are a helpful assistant for Spanish language learning. Consider cultural and situational nuances while assisting."},
        {"role": "user", "content": query}
    ]
    response = openai.ChatCompletion.create(
        model='gpt-4o-mini',
        messages=messages,
        max_tokens=500,
        temperature=0.7,
    )
    return jsonify({'result': response.choices[0].message['content'].strip()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

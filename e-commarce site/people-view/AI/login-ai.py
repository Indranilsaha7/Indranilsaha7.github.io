from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import math
from collections import Counter

app = Flask(__name__)
# Enable CORS so your HTML frontend can communicate with this Python backend
CORS(app)

# Custom Python Advanced AI Knowledge Base (NO API KEYS NEEDED)
KNOWLEDGE_BASE = {
    "What are the exact steps to create an account or register?": "Creating an account requires 4 steps: 1. Enter your email and create a password. 2. Verify the 6-digit code sent to your email. 3. Provide your personal details. 4. Pinpoint your delivery address on the map.",
    "How do I pinpoint my home delivery location on the map?": "On step 4, a map will appear. You can drag the marker or click directly on the map to pinpoint your exact home delivery address. We need this for accurate shipping!",
    "What are the terms and conditions and user rules?": "Our terms require you to provide accurate information and safeguard your password. You can read the full policy by clicking the 'Terms and Conditions' link on the sign-up page.",
    "What is your return policy and refund rule?": "We accept returns for items within 30 days of purchase, provided the items are in their original condition and packaging. Contact support to initiate a refund.",
    "How do I verify my email and where is the code?": "We send a 6-digit verification code to your email inbox. If you don't see it, please check your spam or junk folder. Enter it in Step 2.",
    "What if I forget my password or need to reset it?": "You can reset your password using the 'Forgot Password' link on the main login page.",
    "Is my data secure and private?": "Yes, we prioritize your privacy and secure your data according to our privacy policy.",
    "How do I contact customer support or get help?": "You can contact our support team through the Help Center on our main website.",
    "How long does shipping or delivery take?": "Standard shipping usually takes 3-5 business days depending on your location. You will receive a tracking link via email once dispatched.",
    "What payment methods do you accept?": "We accept all major credit and debit cards, as well as digital wallets like PayPal. You can choose your preferred method at checkout.",
    "Can I cancel or change my order after placing it?": "Orders can be canceled or modified within 2 hours of placement. Please contact customer support immediately for assistance.",
    "How do I apply a discount or promo code?": "You can apply your discount or promo code in the designated box during the checkout process before confirming your payment."
}

def get_cosine_similarity(vec1, vec2):
    """Calculates the mathematical similarity between two sentences."""
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum([vec1[x] * vec2[x] for x in intersection])
    
    sum1 = sum([vec1[x] ** 2 for x in list(vec1.keys())])
    sum2 = sum([vec2[x] ** 2 for x in list(vec2.keys())])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    
    if not denominator:
        return 0.0
    else:
        return float(numerator) / denominator

def text_to_vector(text):
    """Converts a sentence into a mathematical word frequency vector."""
    words = re.findall(r'\w+', text.lower())
    return Counter(words)

@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
        
    user_vec = text_to_vector(user_message)
    best_match = None
    best_score = 0.0

    # Compare the user's message against our Custom AI Knowledge Base
    for question, answer in KNOWLEDGE_BASE.items():
        q_vec = text_to_vector(question)
        score = get_cosine_similarity(user_vec, q_vec)
        if score > best_score:
            best_score = score
            best_match = answer

    # If the mathematical similarity score is higher than 15%, we have a match
    if best_score > 0.15:
        return jsonify({"reply": best_match})
    else:
        return jsonify({"reply": "I am your advanced local fallback AI. I process complex queries about accounts and terms, but I couldn't quite understand that. Could you rephrase your question?"})

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(port=5000, debug=True)
/**
 * Custom Offline AI Engine
 * ------------------------
 * This runs completely locally in the browser background via a Web Worker.
 * It uses zero external APIs, ensuring privacy, instant speed, and high reliability.
 * Because it's a Worker, it will never freeze or slow down the frontend UI.
 * 
 * UPGRADED: Fully implements Cosine Similarity math and the exact Python Knowledge Base!
 */

const KNOWLEDGE_BASE = {
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
};

function textToVector(text) {
    // Converts a sentence into a mathematical word frequency vector
    const words = text.toLowerCase().match(/\w+/g) || [];
    const vector = {};
    for (const w of words) {
        vector[w] = (vector[w] || 0) + 1;
    }
    return vector;
}

function getCosineSimilarity(vec1, vec2) {
    // Calculates the mathematical similarity between two sentences
    const intersection = Object.keys(vec1).filter(k => vec2.hasOwnProperty(k));
    
    let numerator = 0;
    for (const k of intersection) {
        numerator += vec1[k] * vec2[k];
    }
    
    let sum1 = 0;
    for (const k in vec1) {
        sum1 += Math.pow(vec1[k], 2);
    }
    
    let sum2 = 0;
    for (const k in vec2) {
        sum2 += Math.pow(vec2[k], 2);
    }
    
    const denominator = Math.sqrt(sum1) * Math.sqrt(sum2);
    return denominator === 0 ? 0.0 : numerator / denominator;
}

// Listen for messages from the frontend browser window
self.onmessage = function(e) {
    if (e.data.type === 'chat') {
        const userMessage = e.data.message;
        
        if (!userMessage) {
            self.postMessage({ type: 'reply', reply: "I'm here to help! Ask me anything about the sign-up process." });
            return;
        }

        const userVec = textToVector(userMessage);
        let bestMatch = null;
        let bestScore = 0.0;

        // Compare the user's message against our Custom AI Knowledge Base
        for (const [question, answer] of Object.entries(KNOWLEDGE_BASE)) {
            const qVec = textToVector(question);
            const score = getCosineSimilarity(userVec, qVec);
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = answer;
            }
        }
        
        // Add a simulated human typing delay (between 400ms and 900ms)
        const typingDelay = Math.floor(Math.random() * 500) + 400;
        
        setTimeout(() => {
            // If the mathematical similarity score is higher than 15%, we have a match
            if (bestScore > 0.15) {
                self.postMessage({ type: 'reply', reply: bestMatch });
            } else {
                self.postMessage({ type: 'reply', reply: "I am your advanced local fallback AI. I process complex queries about accounts and terms, but I couldn't quite understand that. Could you rephrase your question?" });
            }
        }, typingDelay);
    }
};
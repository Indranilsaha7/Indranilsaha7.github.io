import re
from collections import Counter
import math
import json

import difflib
from pyscript import document, window
from pyodide.http import pyfetch

GIT_REPO = "bcsdevloperteam/E-commarce-ai-brain"

# Global dictionary to hold the state before AI enhancement
PREVIOUS_STATE = {}

CATEGORY_KNOWLEDGE = {}
CORRECT_WORDS = set()
STOP_WORDS = set()
AI_DATA_FETCHED = False

async def fetch_ai_data():
    global CORRECT_WORDS, CATEGORY_KNOWLEDGE, STOP_WORDS, AI_DATA_FETCHED
    if AI_DATA_FETCHED:
        return
        
    try:
        stored_words = window.localStorage.getItem('ai-correct-words')
        stored_categories = window.localStorage.getItem('ai-categories')
        stored_stopwords = window.localStorage.getItem('ai-stopwords')
        
        if stored_words and stored_categories and stored_stopwords:
            CORRECT_WORDS.update(set(json.loads(stored_words)))
            CATEGORY_KNOWLEDGE.update(json.loads(stored_categories))
            STOP_WORDS.update(set(json.loads(stored_stopwords)))
            AI_DATA_FETCHED = True
            return
    except Exception as e:
        window.console.warn(f"Failed to load from local storage: {str(e)}")

    # Fetch correct words
    words_url = f"https://raw.githubusercontent.com/{GIT_REPO}/main/correct-words.txt"
    try:
        response = await pyfetch(words_url, method="GET")
        if response.ok:
            content = await response.string()
            if "[AI_BRAIN_WORDS]" in content:
                content = content.split("[AI_BRAIN_WORDS]")[1]
            words = [line.strip().lower() for line in content.splitlines() if line.strip() and not line.startswith('#')]
            CORRECT_WORDS.update(set(words))
            window.localStorage.setItem('ai-correct-words', json.dumps(words))
    except Exception as e:
        window.console.error(f"Error fetching correct words: {str(e)}")

    # Fetch category knowledge
    cat_url = f"https://raw.githubusercontent.com/{GIT_REPO}/main/category-knowledge.json"
    try:
        response = await pyfetch(cat_url, method="GET")
        if response.ok:
            content = await response.string()
            categories = json.loads(content)
            CATEGORY_KNOWLEDGE.update(categories)
            window.localStorage.setItem('ai-categories', json.dumps(categories))
            for keywords in CATEGORY_KNOWLEDGE.values():
                CORRECT_WORDS.update(keywords.split())
    except Exception as e:
        window.console.error(f"Error fetching category knowledge: {str(e)}")

    # Fetch stop words
    stop_url = f"https://raw.githubusercontent.com/{GIT_REPO}/main/stop-words.txt"
    try:
        response = await pyfetch(stop_url, method="GET")
        if response.ok:
            content = await response.string()
            stopwords = [line.strip().lower() for line in content.splitlines() if line.strip()]
            STOP_WORDS.update(set(stopwords))
            window.localStorage.setItem('ai-stopwords', json.dumps(stopwords))
    except Exception as e:
        window.console.error(f"Error fetching stop words: {str(e)}")

    AI_DATA_FETCHED = True

def get_cosine_similarity(vec1, vec2):
    """Calculates mathematical similarity between two text vectors."""
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum([vec1[x] * vec2[x] for x in intersection])
    
    sum1 = sum([vec1[x] ** 2 for x in list(vec1.keys())])
    sum2 = sum([vec2[x] ** 2 for x in list(vec2.keys())])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    
    if not denominator:
        return 0.0
    return float(numerator) / denominator

def extract_tags(text, top_n=6):
    """
    Extracts the most frequent non-stop words from the text to serve as product tags.
    """
    # Find words with 3 or more letters
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    
    if CORRECT_WORDS:
        filtered_words = [word for word in words if word not in STOP_WORDS and word in CORRECT_WORDS]
    else:
        filtered_words = [word for word in words if word not in STOP_WORDS]
    
    # Count frequencies
    word_counts = Counter(filtered_words)
    
    # Return the top N most common words
    most_common = word_counts.most_common(top_n)
    # Format tags to start with uppercase for a better look
    return [word.capitalize() for word, count in most_common]

def fix_typos(text):
    """Fixes typos using a dynamic similarity threshold like modern spell checkers."""
    if not text or not CORRECT_WORDS:
        return text
        
    # Pre-compute list once per call to speed up matching
    correct_words_list = list(CORRECT_WORDS)
        
    def replace_word(match):
        word = match.group(0)
        word_lower = word.lower()
        
        # Skip short words, stop words, or words that are already correct
        if len(word_lower) <= 3 or word_lower in STOP_WORDS or word_lower in CORRECT_WORDS:
            return word
            
        # Dynamic cutoff: longer words can tolerate more severe typos
        # e.g., length 4 -> 0.75, length 8 -> 0.65, length 10 -> 0.60
        cutoff = max(0.60, 0.85 - (len(word_lower) * 0.025))
        
        matches = difflib.get_close_matches(word_lower, correct_words_list, n=1, cutoff=cutoff)
        
        # If no match, try collapsing repeated letters (e.g. "chiiildrens" -> "childrens")
        if not matches:
            collapsed_word = re.sub(r'(.)\1{2,}', r'\1', word_lower)
            super_collapsed = re.sub(r'(.)\1+', r'\1', word_lower)
            
            candidates_to_test = []
            if collapsed_word != word_lower:
                candidates_to_test.append(collapsed_word)
            if super_collapsed != word_lower and super_collapsed != collapsed_word:
                candidates_to_test.append(super_collapsed)
                
            for candidate in candidates_to_test:
                if candidate in CORRECT_WORDS:
                    matches = [candidate]
                    break
                else:
                    cand_cutoff = max(0.60, 0.85 - (len(candidate) * 0.025))
                    cand_matches = difflib.get_close_matches(candidate, correct_words_list, n=1, cutoff=cand_cutoff)
                    if cand_matches:
                        matches = cand_matches
                        break

        if matches:
            correct = matches[0]
            # Preserve original case
            if word.istitle(): return correct.capitalize()
            elif word.isupper(): return correct.upper()
            return correct
        return word

    return re.sub(r'\b[a-zA-Z]+\b', replace_word, text)

def refine_description(text, product_name="", brand=""):
    """
    Refines the product description by capitalizing the first letter of each sentence, 
    fixing trailing spaces, and ensuring it ends with proper punctuation.
    Rebuilds it into a user-friendly, structured template with bullet points.
    """
    if not text:
        return ""
        
    # Clean up multiple spaces
    text = re.sub(r'\s+', ' ', text.strip())
    # Split text into sentences based on punctuation (.!?) followed by space
    sentences = re.split(r'(?<=[.!?])\s+', text)
    refined_sentences = []
    
    for s in sentences:
        if s:
            # Capitalize the first letter
            s = s[0].upper() + s[1:]
            
            # Ensure sentence ends with punctuation
            if not s.endswith(('.', '!', '?')):
                s += '.'
                
            refined_sentences.append(s)
            
    base_desc = " ".join(refined_sentences)
    
    # Rebuild into a user-friendly format
    friendly_desc = ""
    if product_name:
        friendly_desc += f"✨ {product_name}"
        if brand:
            friendly_desc += f" by {brand}"
        friendly_desc += "\n\n"
        
    friendly_desc += f"📦 Product Overview:\n{base_desc}\n"
    
    if len(refined_sentences) > 1:
        friendly_desc += "\n🔥 Key Highlights:\n"
        for sentence in refined_sentences[:3]:
            friendly_desc += f"• {sentence}\n"
            
    return friendly_desc.strip()

def format_title(text):
    """Capitalizes the first letter of each word properly."""
    if not text:
        return ""
    return " ".join(word.capitalize() for word in text.split())

def predict_category(text):
    """Uses Cosine Similarity to guess the product category from the text."""
    vec = Counter(re.findall(r'\b[a-zA-Z]{3,}\b', text.lower()))
    best_match, best_score = "", 0.0
    for cat, keywords in CATEGORY_KNOWLEDGE.items():
        cat_vec = Counter(keywords.split())
        score = get_cosine_similarity(vec, cat_vec)
        if score > best_score:
            best_score, best_match = score, cat
    return best_match if best_score > 0.05 else ""

async def undo_ai_enhance(event):
    """Restores the inputs to their state before the AI changed them."""
    global PREVIOUS_STATE
    if not PREVIOUS_STATE:
        return
        
    document.getElementById('product-name').value = PREVIOUS_STATE.get('name', '')
    document.getElementById('product-brand').value = PREVIOUS_STATE.get('brand', '')
    document.getElementById('product-category').value = PREVIOUS_STATE.get('category', '')
    document.getElementById('product-tag').value = PREVIOUS_STATE.get('tags', '')
    document.getElementById('product-desc').value = PREVIOUS_STATE.get('description', '')
    
    document.getElementById('undo-ai-btn').style.display = 'none'
    PREVIOUS_STATE = {}

async def handle_ai_enhance(event):
    """
    Triggered directly by the browser DOM when the button is clicked!
    """
    try:
        # Read the DOM inputs directly from Python
        desc_input = document.getElementById('product-desc')
        name_input = document.getElementById('product-name')
        brand_input = document.getElementById('product-brand')
        cat_input = document.getElementById('product-category')
        tag_input = document.getElementById('product-tag')
        btn = document.getElementById('ai-enhance-btn')
        
        description = desc_input.value
        product_name = name_input.value
        brand = brand_input.value
        category = cat_input.value
        tags = tag_input.value
        
        if not description and not product_name:
            window.alert("Please enter a product name or description first.")
            return
            
        # Save the current state before making any AI modifications
        global PREVIOUS_STATE
        PREVIOUS_STATE = {
            'name': product_name,
            'brand': brand,
            'category': category,
            'tags': tags,
            'description': description
        }
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading AI Brain...'
        await fetch_ai_data()
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...'
        
        # Fix typos using the AI brain before further processing
        product_name = fix_typos(product_name)
        brand = fix_typos(brand)
        description = fix_typos(description)
        
        combined_text = f"{product_name} {brand} {category} {description}"
        
        formatted_name = format_title(product_name)
        formatted_brand = format_title(brand)
        new_tags = extract_tags(combined_text, top_n=8)
        refined_desc = refine_description(description, formatted_name, formatted_brand)
        suggested_cat = predict_category(combined_text)

        if new_tags: tag_input.value = ", ".join(new_tags)
        if refined_desc: desc_input.value = refined_desc
        if suggested_cat and not cat_input.value: cat_input.value = suggested_cat
        if formatted_name: name_input.value = formatted_name
        if formatted_brand: brand_input.value = formatted_brand
        
        btn.innerHTML = '<i class="fas fa-magic"></i> AI Enhance'
        document.getElementById('undo-ai-btn').style.display = 'inline-block'
    except Exception as e:
        window.console.error(str(e))
        window.alert("Error in Python AI script: " + str(e))
        btn = document.getElementById('ai-enhance-btn')
        btn.innerHTML = '<i class="fas fa-magic"></i> AI Enhance'

async def handle_vision_ai(event):
    btn = document.getElementById('ai-vision-btn')
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing Image...'
    
    try:
        img_preview = document.getElementById('image-preview')
        base64_data = ""
        
        # Check if single or multiple images are loaded into the UI
        if img_preview.style.display != 'none' and img_preview.src.startswith('data:image'):
            base64_data = img_preview.src
        else:
            images_preview = document.getElementById('images-preview')
            if images_preview and images_preview.children.length > 0:
                first_img = images_preview.children.item(0)
                if first_img.src.startswith('data:image'):
                    base64_data = first_img.src
                    
        if not base64_data:
            window.alert("Please upload a product image first before using AI Vision.")
            btn.innerHTML = '<i class="fas fa-camera"></i> AI Vision Fill'
            return
            
        use_mock = False
        # Hardcoded API key for testing
        api_key = "AIzaSyAWjS9kHsdCvzGuPrRyyKpSyb5zwaNeqQ8"
                
        mime_type = "image/jpeg"
        b64_string = ""
        if "data:" in base64_data and ";base64," in base64_data:
            mime_type, b64_string = base64_data.split(";base64,")
            mime_type = mime_type.replace("data:", "")
            
        vision_data = None
        
        if use_mock:
            # SKIP API: Use Dummy Data instead of contacting Google
            vision_data = {
                "name": "Simulated Smart Gadget",
                "brand": "MockBrand",
                "category": "electronics",
                "description": "This is a simulated description generated without an API key! The actual AI Vision API call was skipped for testing."
            }
        else:
            models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
            payload = {
                "contents": [{
                    "parts": [
                        {"text": "Analyze this product image. Return a JSON object with the following keys: 'name' (short product name), 'brand' (brand name if visible, else empty), 'category' (one of: electronics, fashion, home, sports, beauty, toys, automotive, grocery, health, books), 'description' (a brief catchy product description). Do not use markdown wrapping for the JSON, just pure JSON."},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": b64_string
                            }
                        }
                    ]
                }]
            }
            
            for model in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                
                try:
                    response = await pyfetch(url, method="POST", headers={"Content-Type": "application/json"}, body=json.dumps(payload))
                    
                    if response.ok:
                        window.console.log(f"?api--k == work.done with {model}")
                        data = await response.json()
                        text = ""
                        try:
                            text = data["candidates"][0]["content"]["parts"][0]["text"]
                            text = text.replace("```json", "").replace("```", "").strip()
                            vision_data = json.loads(text)
                            break
                        except Exception as parse_e:
                            window.console.error(f"Error parsing Gemini response from {model}: {str(parse_e)}. Text: {text}")
                            window.alert("AI returned an invalid format. The image might not be clear enough.")
                            break
                    elif response.status == 403:
                        window.alert("Invalid API Key or blocked request. Please verify your key and try again.")
                        btn.innerHTML = '<i class="fas fa-camera"></i> AI Vision Fill'
                        return
                    else:
                        window.console.warn(f"Model {model} failed with status {response.status}")
                except Exception as req_e:
                    window.console.error(f"Request failed for {model}: {str(req_e)}")
                    
            if not vision_data:
                window.alert("Vision API Error: All models failed to analyze the image.")
                btn.innerHTML = '<i class="fas fa-camera"></i> AI Vision Fill'
                return
                
        if vision_data:
            # Save state so the user can easily undo if they don't like the AI results
            global PREVIOUS_STATE
            PREVIOUS_STATE = {
                'name': document.getElementById('product-name').value,
                'brand': document.getElementById('product-brand').value,
                'category': document.getElementById('product-category').value,
                'tags': document.getElementById('product-tag').value,
                'description': document.getElementById('product-desc').value
            }
            document.getElementById('undo-ai-btn').style.display = 'inline-block'
            
            # Auto-fill fields if Gemini found data
            if vision_data.get("name"): document.getElementById('product-name').value = vision_data["name"]
            if vision_data.get("brand"): document.getElementById('product-brand').value = vision_data["brand"]
            if vision_data.get("category"): document.getElementById('product-category').value = vision_data["category"]
            if vision_data.get("description"): document.getElementById('product-desc').value = vision_data["description"]
            
            # Determine if we need to swap to custom category
            cat_input = document.getElementById('product-category')
            cat_options = [opt.value for opt in cat_input.options]
            if vision_data.get("category") and vision_data.get("category").lower() not in cat_options:
                cat_input.value = "other"
                custom_cat = document.getElementById('custom-category')
                custom_cat.style.display = "block"
                custom_cat.required = True
                custom_cat.value = vision_data["category"]
            
            # Automatically extract SEO tags based on new data
            combined_text = f"{vision_data.get('name', '')} {vision_data.get('brand', '')} {vision_data.get('description', '')}"
            await fetch_ai_data()
            new_tags = extract_tags(combined_text, top_n=8)
            if new_tags:
                document.getElementById('product-tag').value = ", ".join(new_tags)
            
    except Exception as e:
        window.console.error(f"Vision AI Exception: {str(e)}")
        window.alert(f"Failed to analyze image: {str(e)}")
        
    btn.innerHTML = '<i class="fas fa-camera"></i> AI Vision Fill'
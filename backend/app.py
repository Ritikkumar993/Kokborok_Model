from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from dotenv import load_dotenv
import os
import threading

load_dotenv()

app = Flask(__name__)

# Allow requests from your Vercel frontend
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:5500,http://127.0.0.1:5500')
CORS(app, origins=[origin.strip() for origin in allowed_origins.split(',')])

# Model configuration
MODEL_NAME = os.environ.get('MODEL_NAME', 'ritik3412/Kokborok_model')

# Lazy-load model (server starts immediately, model loads in background)
nlp = None
model_loading = False
model_error = None

def load_model():
    """Load model in background so the server starts immediately."""
    global nlp, model_loading, model_error
    model_loading = True
    print("=" * 60)
    print(f"Loading model from Hugging Face: {MODEL_NAME}")
    print("This may take a few minutes on first run...")
    print("=" * 60)
    try:
        nlp = pipeline(
            "token-classification",
            model=MODEL_NAME,
            aggregation_strategy="simple"
        )
        print("✓ Model loaded successfully!")
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        model_error = str(e)
    finally:
        model_loading = False

# Start loading model in background thread
threading.Thread(target=load_model, daemon=True).start()

def get_model():
    """Get the model, waiting if it's still loading."""
    global nlp
    if nlp is not None:
        return nlp
    if model_loading:
        return "loading"
    if model_error:
        return None
    return None

@app.route('/')
def health_check():
    status = "ready" if nlp is not None else ("loading" if model_loading else "error")
    return jsonify({
        'status': status,
        'model_loaded': nlp is not None,
        'model_name': MODEL_NAME
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    model = get_model()
    if model == "loading":
        return jsonify({'error': 'Model is still loading. Please wait 1-2 minutes and try again.'}), 503
    if model is None:
        return jsonify({'error': f'Model failed to load: {model_error}'}), 500

    try:
        data = request.json
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Use pipeline to get predictions
        tokens = nlp(text)

        # Format results
        results = []
        for token in tokens:
            results.append({
                'text': token['word'].strip(),
                'tag': token['entity_group'],
                'score': round(float(token['score']) * 100, 1)
            })

        return jsonify({'tokens': results})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/model-info', methods=['GET'])
def model_info():
    if nlp is None:
        return jsonify({'error': 'Model not loaded yet'}), 503

    model = nlp.model
    tokenizer = nlp.tokenizer
    id2label = model.config.id2label

    return jsonify({
        'architecture': model.config.architectures[0],
        'num_labels': len(id2label),
        'labels': list(id2label.values()),
        'vocab_size': model.config.vocab_size,
        'max_length': tokenizer.model_max_length
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

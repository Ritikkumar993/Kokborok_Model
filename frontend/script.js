// ============================================
// API URL Configuration
// ============================================
// In production (Vercel): Leave empty — Vercel rewrites proxy /api/* to Render
// For local development: Set to 'http://localhost:5000'
const API_BASE_URL = '';
// ============================================

// POS Tag definitions with colors and descriptions
const posTagsInfo = {
    'ADJ': { color: '#fbbf24', name: 'Adjective', desc: 'Describes nouns' },
    'ADP': { color: '#a78bfa', name: 'Adposition', desc: 'Prepositions/postpositions' },
    'ADV': { color: '#34d399', name: 'Adverb', desc: 'Modifies verbs/adjectives' },
    'AUX': { color: '#60a5fa', name: 'Auxiliary', desc: 'Helping verbs' },
    'CCONJ': { color: '#f472b6', name: 'Coordinating Conjunction', desc: 'Connects clauses' },
    'DET': { color: '#fb923c', name: 'Determiner', desc: 'Articles, quantifiers' },
    'INTJ': { color: '#f87171', name: 'Interjection', desc: 'Exclamations' },
    'NOUN': { color: '#4ade80', name: 'Noun', desc: 'Person, place, thing' },
    'NUM': { color: '#22d3ee', name: 'Numeral', desc: 'Numbers' },
    'PART': { color: '#c084fc', name: 'Particle', desc: 'Function words' },
    'PRON': { color: '#818cf8', name: 'Pronoun', desc: 'Replaces nouns' },
    'PROPN': { color: '#10b981', name: 'Proper Noun', desc: 'Specific names' },
    'PUNCT': { color: '#94a3b8', name: 'Punctuation', desc: 'Punctuation marks' },
    'SCONJ': { color: '#ec4899', name: 'Subordinating Conjunction', desc: 'Introduces clauses' },
    'UNK': { color: '#6b7280', name: 'Unknown', desc: 'Unrecognized tokens' },
    'VERB': { color: '#3b82f6', name: 'Verb', desc: 'Action or state' },
    'X': { color: '#64748b', name: 'Other', desc: 'Other categories' }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeLegend();
    setupEventListeners();
});

// Create the legend
function initializeLegend() {
    const legendGrid = document.getElementById('legend-grid');
    if (!legendGrid) return;

    Object.entries(posTagsInfo).forEach(([tag, info]) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${info.color}"></div>
            <div class="legend-info">
                <div class="legend-tag">${tag}</div>
                <div class="legend-desc">${info.name}</div>
            </div>
        `;
        legendGrid.appendChild(legendItem);
    });
}

// Setup event listeners
function setupEventListeners() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const textInput = document.getElementById('text-input');

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeText);
    }

    if (textInput) {
        // Allow Ctrl+Enter to trigger analysis
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                analyzeText();
            }
        });
    }
}

// Analyze text using the backend API
async function analyzeText() {
    const textInput = document.getElementById('text-input');
    const text = textInput.value.trim();

    if (!text) {
        alert('Please enter some text to analyze');
        return;
    }

    // Show loading state
    const analyzeBtn = document.getElementById('analyze-btn');
    const originalText = analyzeBtn.textContent;
    analyzeBtn.textContent = 'Analyzing...';
    analyzeBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Analysis failed');
        }

        const data = await response.json();
        displayResults(data.tokens);

    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            alert('Cannot connect to the API server. The server may be starting up (takes ~30-60 seconds on first request). Please try again in a moment.');
        } else {
            alert(`Analysis failed: ${error.message}`);
        }
    } finally {
        analyzeBtn.textContent = originalText;
        analyzeBtn.disabled = false;
    }
}

// Display the analysis results
function displayResults(tokens) {
    const outputSection = document.getElementById('output-section');
    const resultsContainer = document.getElementById('results-container');

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Create token elements
    tokens.forEach(token => {
        const tokenElement = document.createElement('span');
        tokenElement.className = 'token';
        const tagInfo = posTagsInfo[token.tag] || posTagsInfo['UNK'];
        tokenElement.style.backgroundColor = tagInfo.color;
        tokenElement.style.color = '#1e293b';

        tokenElement.innerHTML = `
            <span class="token-text">${token.text}</span>
            <span class="token-tag">${token.tag}</span>
        `;

        // Add tooltip
        tokenElement.title = `${tagInfo.name}: ${tagInfo.desc} (${token.score}% confidence)`;

        resultsContainer.appendChild(tokenElement);
    });

    // Show output section
    outputSection.style.display = 'block';

    // Smooth scroll to results
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Example sentences for quick testing
const exampleSentences = [
    "Ang nwng kwrwi sa.",
    "Nwng Tripura o boro.",
    "Kokborok tei Tripura ni rajya tei."
];

// Add example buttons (optional enhancement)
function addExampleButtons() {
    const inputSection = document.querySelector('.input-section');
    if (!inputSection) return;

    const examplesDiv = document.createElement('div');
    examplesDiv.style.marginTop = '1rem';
    examplesDiv.innerHTML = '<p style="font-size: 0.9rem; color: var(--text-secondary);">Try examples:</p>';

    exampleSentences.forEach(sentence => {
        const btn = document.createElement('button');
        btn.textContent = sentence;
        btn.style.cssText = 'margin: 0.25rem; padding: 0.5rem; border: 1px solid var(--border-color); background: white; border-radius: 4px; cursor: pointer; font-size: 0.85rem;';
        btn.onclick = () => {
            document.getElementById('text-input').value = sentence;
        };
        examplesDiv.appendChild(btn);
    });

    inputSection.appendChild(examplesDiv);
}

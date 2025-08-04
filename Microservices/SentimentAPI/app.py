from flask import Flask, request, jsonify
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

client = InferenceClient(
    provider="auto",
    api_key=os.getenv("HF_TOKEN"),
)


@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.get_json()
    text = data.get("text", "")

    summarized = client.summarization(text, model="facebook/bart-large-cnn")

    # return jsonify({
    #     "summary": summarized.summary_text
    # })

    results = client.text_classification(
        summarized.summary_text, model="ProsusAI/finbert")
    top_result = max(results, key=lambda x: x.score)

    return jsonify({
        "label": top_result.label,
        "score": top_result.score
    })


if __name__ == '__main__':
    app.run(port=5001)

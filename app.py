import os
from flask import Flask, render_template, request, jsonify

# --- Force requests/SSL to use certifi CA bundle ---
try:
    import certifi
    ca_path = certifi.where()
    os.environ['REQUESTS_CA_BUNDLE'] = ca_path
    os.environ['SSL_CERT_FILE'] = ca_path
    print("Using certifi CA bundle:", ca_path)
except Exception as e:
    print("Could not configure certifi:", e)

# --- Gemini client import ---
try:
    from google import genai
except ImportError as e:
    print("ImportError while loading google.genai:", e)
    genai = None

app = Flask(__name__)

# --- Gemini setup ---
API_KEY = os.getenv("GOOGLE_API_KEY")
client = None
if genai is not None and API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
        print("GenAI client initialized successfully")
    except Exception as e:
        print("GenAI initialization failed:", type(e).__name__, e)
else:
    print("Gemini client not configured (missing import or API_KEY)")

# --- Routes ---
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file:
        return jsonify({"error": "Empty file"}), 400

    info = {
        "name": file.filename,
        "size_bytes": request.content_length,
        "type": file.mimetype,
    }

    filepath = os.path.join("static", "uploads", file.filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    file.save(filepath)

    # --- Gemini integration ---
    if client:
        try:
            if file.mimetype.startswith("image/"):
                resp = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=f"Provide a short caption for an image file named {file.filename}"
                )
                info["gemini_caption"] = resp.text
            else:
                resp = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=f"Summarize this file: {file.filename} in one line."
                )
                info["gemini_summary"] = resp.text
        except Exception as e:
            # Capture SSL or API errors
            import traceback
            info["gemini_error"] = f"{type(e).__name__}: {e}"
            print("Gemini request failed:", traceback.format_exc())
    else:
        info["gemini_notice"] = "Gemini not configured (API_KEY missing or client init failed)."

    return jsonify(info)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB

def human_readable_size(num_bytes: int) -> str:
    step = 1024.0
    units = ["B", "KB", "MB", "GB", "TB"]
    size = float(num_bytes)
    for u in units:
        if size < step:
            return f"{size:.2f} {u}"
        size /= step
    return f"{size:.2f} PB"

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part named 'file' in form data."}), 400

    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "No file selected."}), 400

    filename = secure_filename(f.filename)

    # measure size without saving
    pos = f.stream.tell()
    f.stream.seek(0, os.SEEK_END)
    size_bytes = f.stream.tell()
    f.stream.seek(pos, os.SEEK_SET)

    resp = {
        "filename": filename,
        "size_bytes": size_bytes,
        "size_human": human_readable_size(size_bytes),
        "mimetype": f.mimetype or "application/octet-stream",
    }
    return jsonify(resp), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

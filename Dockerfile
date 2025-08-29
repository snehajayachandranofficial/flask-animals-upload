# Simple container for running the Flask app with Gunicorn
FROM python:3.11-slim

WORKDIR /app

# avoid creating .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

# Install runtime dependencies
COPY requirements.txt ./ 
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Expose port that Gunicorn will bind to (App Runner / many platforms expect 8080)
EXPOSE 8080

# Use gunicorn to run the app (4 workers)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "app:app"]

# Use official Python runtime as a parent image
# Use official Python runtime as a parent image
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app/backend
# This ensures absolute imports (from backend.xxx) work correctly
COPY . ./backend

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Set PYTHONPATH to /app so 'backend' is importable
ENV PYTHONPATH=/app

# Run main.py as a module
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]

# Use a pipeline as a high-level helper
from transformers import pipeline

messages = [
    {"role": "user", "content": "Who are you?"},
]
pipe = pipeline("text-generation", model="mistralai/Mistral-Small-24B-Instruct-2501")
pipe(messages)
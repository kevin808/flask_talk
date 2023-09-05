#Note: The openai-python library support for Azure OpenAI is in preview.
import os
import openai
openai.api_type = "azure"
openai.api_base = os.getenv("AZURE_OPENAI_API_HOST")
openai.api_version = "2023-03-15-preview"
openai.api_key = os.getenv("AZURE_OPENAI_API_KEY")

def get_bot_response(message):
#Note: The openai-python library support for Azure OpenAI is in preview.
    response_text = 'No result'
    try:
        response = openai.ChatCompletion.create(
            engine="gpt-35-turbo",
            messages = message,
            temperature=1.0,
            max_tokens=100,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None)
        response_text = response['choices'][0]['message']['content']
    except Exception as e:
        response_text = str(e)
    # Return the formatted response text
    return response_text

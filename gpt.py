import os
from openai import OpenAI

client = OpenAI(
  api_key=os.environ['OPENAI_API_KEY'],  # this is also the default, it can be omitted
  base_url=os.environ['BASE_URL']
)

def get_bot_response(message):
    print(message)
    if message[-1]['content'] == '.':
        return '抱歉，我没有听清楚'
    response_text = ''
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages = message,
            temperature=1.0,
            max_tokens=100,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None)
        # print(response)
        response_text = response.choices[0].message.content

    except Exception as e:
        response_text = str(e)

    return response_text

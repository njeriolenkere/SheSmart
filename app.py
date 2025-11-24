import requests
import json
import gradio as gr

# Replace with the actual model API endpoint for llama3
MODEL_API_URL = "http://localhost:11434/api/generate"

# add labels indicating the user and bot messages
def generate_response(prompt, history):
    conversation_history = []
    for human, assistant, prompt in history:
        conversation_history.append({"role": "user", "content": human })
        conversation_history.append({"role": "assistant", "content": assistant })
    conversation_history.append({"role": "user", "content": prompt})
    full_prompt = "\n".join([f"{entry['role']}: {entry['content']}" for entry in conversation_history])  # Extract the content from each entry


    headers = {'Content-Type': 'application/json'}

    data = {
        "model": "llama3",
        "Stream": False,
        "prompt": full_prompt,
        "temperature": 0.5,  # Set the desired temperature
        #customize what the bot can talk about
        "system": "You are an Ai tutor. Answer only questions related to Technology questions as Ada, the ai assistant only. If use asks questions not related to Technology or programming, be kind to remind them you are an Ada,  ai assistant and they should ask only questions related to Technology or programming",
    } 

    response = requests.post(MODEL_API_URL, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        response_text = response.text
        data = json.loads(response_text)
        actual_response_model = data["response"]
        conversation_history.append(actual_response_model)
        return actual_response_model
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None

iface = gr.ChatInterface(
    fn=generate_response,
    textbox=gr.Textbox(placeholder="Enter a prompt and get an AI-generated response!", scale=7),
    title="Learn Tech with Ada",
    description="Learn how to code with to Ada Ai",
)

iface.launch()


from langchain_ollama import OllamaLLM
#easily interact with LLM using langchain
#OllamaLLM: This is the model you’re using for generating responses.
#ChatPromptTemplate: This helps in creating a template for the chatbot’s prompts.
#Convert this code into API(RESTful API) using FastAPI cand call the API from frontend
from langchain_core.prompts import ChatPromptTemplate


#defining prompt template
#This template defines how the chatbot should format its responses. It includes 
#placeholders for the conversation history ({context}) and the user’s question ({questions}).
template = """
Answer the question below
Here is the conversation history: {context} #embade a var

Question: {questions}
Answer: 
"""

#initializing model and prompt
model = OllamaLLM(model="llama3.1") #model: Initializes the OllamaLLM model named “llama3”
prompt = ChatPromptTemplate.from_template(template) #prompt: Creates a prompt template from the defined template.
chain = prompt | model #chain: Combines the prompt and the model into a chain that can process inputs and generate responses.

#defining the conversations handler

#context: Initializes an empty string to store the conversation history.
#print: Welcomes the user and instructs them on how to exit.
#while True: Creates an infinite loop to keep the conversation going until the user types “exit”.
#user_input: Captures the user’s input.
#if user_input.lower() == “exit”: Checks if the user wants to exit the conversation.
#chain.invoke: Generates a response from the model using the current context and the user’s question.
#print: Displays the model’s response.
#context +=: Updates the conversation history with the user’s input and the model’s response.
def handle_conversation():
    context = " "
    print("welcome to ai chatboat. Type x to quit")
    while True:
        user_input = input(" You: ")
        if user_input.lower() == "exit":
            break
        #gen response
        result = chain.invoke({"context": context, "questions": user_input})
        print("Bot: ", result)
        #save history for Ai to remember
        context += f"\nUser: {user_input}\nAI: {result}"

#call the function/ Running the Conversation Handler
if __name__ =="__main__":
    handle_conversation()

    #use python app.py to run the model
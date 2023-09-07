import requests
from botok import WordTokenizer

file_name="Marpa_2.txt"
file_path = f'input/{file_name}'  # Replace with the path to your file
file_contents=''
try:
    with open(file_path, 'r', encoding='utf-8') as file:
        file_contents = file.read()
except FileNotFoundError:
    print(f"File '{file_path}' not found.")
except Exception as e:
    print(f"An error occurred: {e}")

url = "https://dakje.io/api/tokenize"
headers = {"Content-Type": "application/json"}
data = {"content": file_contents}


def get_tokens(wt, text):
    tokens = wt.tokenize(text, split_affixes=False)
    return tokens
response = requests.post(url, json=data, headers=headers)
wt = WordTokenizer()
if response.status_code == 200:
    response_data = response.json()
    data=response_data
    sentences = [sentence_data['content'] for sentence_data in data['sentences']]
    for sentence_data in data['sentences']:
        text = sentence_data['content']
        tokens = get_tokens(wt, text)
        print(tokens)
    joined_content = '\n'.join(sentences)
    output_file_path = file_name
    with open(output_file_path, 'w', encoding='utf-8') as output_file:
        output_file.write(joined_content)

    print(f"Joined content written to '{output_file_path}'")
else:
    print("Request failed with status code:", response.status_code)
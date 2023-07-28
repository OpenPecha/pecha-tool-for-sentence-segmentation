import csv
import psycopg2
from psycopg2 import Error
from datetime import datetime
import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

def clean_text(text):
    # Remove leading and trailing whitespace
    cleaned_text = text.strip()
    # Convert to lowercase
    cleaned_text = cleaned_text.lower()
    return cleaned_text

group=0

def upload_data_to_postgres(txt_file, database, user, password, host, port, table_name):
    global group
    try:
        # Establish a connection to the PostgreSQL database
        connection = psycopg2.connect(
            database=database,
            user=user,
            password=password,
            host=host,
            port=port
        )
        cursor = connection.cursor()

        # Upload data from TXT file to the table
        with open(txt_file, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            batch = os.path.basename(txt_file)
            line_count=0

            for idx in range(0, len(lines), 5):
                original_text = " ".join([clean_text(line) for line in lines[idx:idx+5]])
                print(original_text)
                createdAt = datetime.now()
                updatedAt = datetime.now()
                line_count+=1
                if(line_count%30==0):
                    group+=1
                insert_query = f'INSERT INTO {table_name} (original_text, "createdAt", "updatedAt", "batch", "group") VALUES (%s, %s, %s, %s, %s);'
                data_to_insert = (original_text, createdAt, updatedAt, batch, group)
                cursor.execute(insert_query, data_to_insert)
                print(f'Group {group}: Lines merged and inserted')
                connection.commit()  # Commit after every 30 groups


    except (Exception, Error) as e:
        print(f"Error while uploading data to PostgreSQL: {e}")
    finally:
        if connection:
            cursor.close()
            connection.close()
            print("Connection closed.")

# Replace these values with your PostgreSQL credentials and table name
database = os.environ.get("DATABASE")
user = os.environ.get("USER")
password = os.environ.get("PASSWORD")
host = os.environ.get("HOST")  # Usually 'localhost' if running locally
port = os.environ.get("PORT")  # Usually 5432 by default
table_name = '"Text"'  # Replace 'your_table' with the actual table name in your database

input_folder_path = "input"   # Replace this with the path to your TXT file

for filename in os.listdir(input_folder_path):
    if filename.endswith(".txt"):
        txt_file_path = os.path.join(input_folder_path, filename)
        upload_data_to_postgres(txt_file_path, database, user, password, host, port, table_name)
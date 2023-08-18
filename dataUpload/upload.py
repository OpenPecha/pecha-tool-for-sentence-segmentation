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

def remove_file_extension(filename):
    # Find the last occurrence of '.'
    index = filename.rfind('.')

    # Remove the extension if found
    if index != -1:
        filename_without_extension = filename[:index]
    else:
        filename_without_extension = filename

    return filename_without_extension

# eachtime change category and startInde
category="med"
START_INDEX=1000 
batch_number =START_INDEX
last_batch_number=START_INDEX
def upload_data_to_postgres(txt_file, database, user, password, host, port, table_name,group_name,category):
    LINES_PER_TEXT = 5
    TEXT_PER_BATCH = 10
    
    global batch_number
    global last_batch_number
    global START_INDEX
    line_count=START_INDEX
    try:
        connection = psycopg2.connect(
            database=database,
            user=user,
            password=password,
            host=host,
            port=port
        )
        cursor = connection.cursor()
        with open(txt_file, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            text_name = remove_file_extension(os.path.basename(txt_file))
            line_count = START_INDEX
            batch_number=last_batch_number
            print(batch_number)
            for idx in range(0, len(lines), LINES_PER_TEXT):
                 original_text = " ".join([clean_text(line) for line in lines[idx:idx + LINES_PER_TEXT]])
                 createdAt = datetime.now()
                 updatedAt = datetime.now()
                 id = group_name+"_"+text_name+'_s-segment_'+category+'_' + str(idx) + '-' + str(idx + LINES_PER_TEXT - 1)
                 order=line_count   
                 insert_query = f'INSERT INTO {table_name} ("id",original_text, "createdAt", "updatedAt","order","batch") VALUES (%s,%s, %s, %s,%s,%s);'
                 data_to_insert = (id, original_text, createdAt, updatedAt, order,category+"_"+str(batch_number)+group_name)
                 cursor.execute(insert_query, data_to_insert)
                 if(line_count!=0 and line_count%TEXT_PER_BATCH==0):
                    batch_number += 1
                 line_count += 1
                #  print(f'Batch {batch_number}: Lines merged and inserted {str(idx)}-{str(idx + LINES_PER_TEXT - 1)}')
                 last_batch_number=batch_number
                 connection.commit()


    except (Exception, Error) as e:
        print(f"Error while uploading data to PostgreSQL: {e}")
    finally:
        if connection:
            line_count = 0
            cursor.close()
            connection.close()
            print("Connection closed.")


database = os.environ.get("DATABASE")
user = os.environ.get("USER")
password = os.environ.get("PASSWORD")
host = os.environ.get("HOST")  # Usually 'localhost' if running locally
port = os.environ.get("PORT")  # Usually 5432 by default
table_name = '"Text"'  # Replace 'your_table' with the actual table name in your database

input_folder_path = "input"   # Replace this with the path to your TXT file
group_names=['a','b']
for group_name in group_names:
  batch_number=START_INDEX
  last_batch_number=START_INDEX
  for (i,filename) in enumerate(os.listdir(input_folder_path)):
       if filename.endswith(".txt"):
           txt_file_path = os.path.join(input_folder_path, filename)
           upload_data_to_postgres(txt_file_path, database, user, password, host, port, table_name,group_name,category)

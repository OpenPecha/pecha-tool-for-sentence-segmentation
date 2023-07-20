import csv
import psycopg2
from psycopg2 import Error
from datetime import datetime

def clean_text(text):
    # Remove leading and trailing whitespace
    cleaned_text = text.strip()
    # Convert to lowercase
    cleaned_text = cleaned_text.lower()
    return cleaned_text

def upload_data_to_postgres(csv_file, database, user, password, host, port, table_name):
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



        # Upload data from CSV file to the table
        with open(csv_file, 'r',encoding='utf-8') as file:
            csv_data = csv.reader(file)
            next(csv_data)  # Skip the header row if it exists

            for row in csv_data:
                original_text = clean_text(row[0])  # Assuming the CSV has two columns 'original_text' and 'modified_text'
                createdAt = datetime.now()
                modified_text=datetime.now()
                insert_query = f'INSERT INTO "Text" (original_text, "createdAt", "updatedAt") VALUES (%s, %s, %s);'
                data_to_insert=(original_text, createdAt, modified_text)
                cursor.execute(insert_query, data_to_insert)

            connection.commit()

        print("Data upload successful.")

    except (Exception, Error) as e:
        print(f"Error while uploading data to PostgreSQL: {e}")
    finally:
        if connection:
            cursor.close()
            connection.close()
            print("Connection closed.")

# Replace these values with your PostgreSQL credentials and table name
database = "sentensesegmetation"
user = "postgres"
password = "123"
host = "localhost"  # Usually 'localhost' if running locally
port = "5432"  # Usually 5432 by default
table_name = '"Text"'  # Replace 'your_table' with the actual table name in your database

csv_file_path = "data.csv"
upload_data_to_postgres(csv_file_path, database, user, password, host, port, table_name)
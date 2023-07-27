import psycopg2
from psycopg2 import Error
import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()
def delete_all_data_from_table(database, user, password, host, port, table_name):
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

        # Delete all data from the specified table
        delete_query = f"DELETE FROM {table_name};"
        cursor.execute(delete_query)

        connection.commit()

        print("All data deleted from the table.")

    except (Exception, Error) as e:
        print(f"Error while deleting data from table: {e}")
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

csv_file_path = "data.csv"
delete_all_data_from_table(database, user, password, host, port, table_name)
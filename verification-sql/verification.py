import mysql.connector

'''
import datetime
import mysql.connector

cnx = mysql.connector.connect(user='scott', database='employees')
cursor = cnx.cursor()

query = ("SELECT first_name, last_name, hire_date FROM employees "
         "WHERE hire_date BETWEEN %s AND %s")

hire_start = datetime.date(1999, 1, 1)
hire_end = datetime.date(1999, 12, 31)

cursor.execute(query, (hire_start, hire_end))

for (first_name, last_name, hire_date) in cursor:
  print("{}, {} was hired on {:%d %b %Y}".format(
    last_name, first_name, hire_date))

cursor.close()
cnx.close()

SESSIONS TABLE
+-----------------+--------------+------+-----+---------+----------------+
| Field           | Type         | Null | Key | Default | Extra          |
+-----------------+--------------+------+-----+---------+----------------+
| session_id      | int(11)      | NO   | PRI | NULL    | auto_increment |
| user            | varchar(100) | YES  |     | NULL    |                |
| expiration_date | datetime     | YES  |     | NULL    |                |
| session_start   | datetime     | YES  |     | NULL    |                |
| token           | varchar(512) | YES  |     | NULL    |                |
+-----------------+--------------+------+-----+---------+----------------+

FLASHCARDS TABLE
+-----------+--------------+------+-----+---------+----------------+
| Field     | Type         | Null | Key | Default | Extra          |
+-----------+--------------+------+-----+---------+----------------+
| id        | int(11)      | NO   | PRI | NULL    | auto_increment |
| user      | varchar(100) | YES  |     | NULL    |                |
| questions | varchar(200) | YES  |     | NULL    |                |
| answers   | varchar(200) | YES  |     | NULL    |                |
+-----------+--------------+------+-----+---------+----------------+
'''

def main():    

    con = mysql.connector.connect(host="localhost", user="root", passwd="password", db="test")
    cursor = con.cursor()

    getSessionsQuery = ("SELECT * FROM `flashcards`")
    cursor.execute(getSessionsQuery)

    #for row in cursor.fetchall():
    #    print(row)

    for (id, user, questions, answers) in cursor:
      print(" " + str(id) + " " + user + " " + questions + " " + answers)

    con.commit();

    cursor.close()
    con.close()        

if __name__ == "__main__":
    main()
















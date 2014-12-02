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
def assertEqual(val1, val2):
    if val1 == val2:
        print('SUCCESS!')
    else:
        print("FAILURE! " + " expected " + str(val1) + " to be " + str(val2))

def main():    

    con = mysql.connector.connect(host="localhost", user="root", passwd="password", db="test")
    cursor = con.cursor()

    getSessionsQuery = ("SELECT * FROM `flashcards` WHERE flashcards.user=\'test\'")
    cursor.execute(getSessionsQuery)

    #for row in cursor.fetchall():
    #    print(row)

    # 18 test Why? Because
    # 19 test What are the best kind of cats? dead ones
    # 20 test another question another answer

    idx = 0
    for (theId, user, questions, answers) in cursor:
        print(" " + str(theId) + " " + user + " " + questions + " " + answers)
        if idx==0:
            assertEqual(user, 'test')
            assertEqual(questions, 'Why?')
            assertEqual(answers, 'Because')
        elif idx==1:
            assertEqual(user, 'test')
            assertEqual(questions, 'What are the best kind of cats?')
            assertEqual(answers, 'dead ones')            
        else:
            assertEqual(user, 'test')
            assertEqual(questions, 'another question')
            assertEqual(answers, 'another answer')                
        idx+=1

    con.commit();

    cursor.close()
    con.close()        

if __name__ == "__main__":
    main()
















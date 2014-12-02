import mysql.connector

def main():    

    con = mysql.connector.connect(host="localhost", user="root", passwd="password", db="test")
    cursor = con.cursor()

    deleteTestUserQuery = ("DELETE FROM `users` WHERE users.user_name='test'")
    cursor.execute(deleteTestUserQuery)

    deleteTestSessionQuery = "DELETE FROM `sessions` WHERE sessions.token='\"1234567890\"'"
    cursor.execute(deleteTestSessionQuery)

    #commit!!!
    con.commit();

    cursor.close()
    con.close()        

if __name__ == "__main__":
    main()



import mysql.connector

def main():    

    try:
        con = mysql.connector.connect(host="localhost", user="root", passwd="password", db="test")
        cursor = con.cursor()

        createTestUserQuery = ("INSERT INTO `users` VALUES (NULL, 'test', 'test', 'test@test.org')")
        cursor.execute(createTestUserQuery)

        createTestSessionQuery = "INSERT INTO `sessions` VALUES (10, 'test', DATE_ADD(NOW(), INTERVAL 1 DAY), NOW(), '\"1234567890\"')"
        cursor.execute(createTestSessionQuery)

        #commit!!!
        con.commit();

        cursor.close()
        con.close()        

    except mysql.connector.Error as err:
        print("Something went wrong: {}".format(err))    

if __name__ == "__main__":
    main()
















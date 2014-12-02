FlashCards
==========

A Flashcard Webapp



MOTIVATION & INTRODUCTION:
For this project, I chose to actually write the application to be tested from scratch. A longtime goal of mine has been to create a flashcards webapp which would allow for extreme customization in the types of flashcards/quizzing which is possible. Examples of such specialty cases include flashcards for the conjugations of verbs in various tenses in Spanish, translation based flashcards using the Google Translate API, and mathematical questions using the Wolfram API. 

Obviously such a webapp in a professional sense is quite the undertaking for an individual, so I started early, almost a month in advance. From a functionality perspective, the webapp is still in its extreme infancy; the actual interactive testing functionality of the application is barely even started.

The majority of development time for the application as it currently sits has gone towards the application's infrastructure, of which a large portion was written utilizing Behavior-Driven Development. The components which are farthest along in their development cycle include the backend's Object-Relational Mapping database interface, the front-end's FlashCards Configuration Tool for the creation of a user's flashcards, webapp's CSRF-protected user authentication system, and the front-end's RESTful AJAX services for communicating with the server.

APPLICATION ARCHITECTURE:
FlashCards, the comically unoriginal and generic name with which I have coined the application in its current state of infancy, is composed of three main components written in different languages/frameworks.

1.) Application Frontend: The frontend is written entirely in Google's AngularJS JavaScript library, utilizing the Jasmine testing framework supplemented by several libraries meant to enhance Jasmine's testing capabilities for usage with AngularJS, such as angular-mocks (https://docs.angularjs.org/api/ngMock/object/angular.mock).

2.) Application Backend: FlashCards' backend is written entirely in NodeJS, a popular serverside JavaScript library which specializes in using asynchronous i/o operations to speed up application execution. The asynchronous nature of NodeJS was the cause for many issues in developing an easily testable backend; such common components to serverside software such as database API functions which return the result of a database query are NOT possible in NodeJS. This led to an unusual application architecture which often required additional steps to make easily testable via unit tests. The core of the application backend currently exists in ORM.js, which contains the entirety of the Object-Relational Mapping programming interface which is called by the server script (server.js).

3.) Database: The application's database of choice is MySQL due to its simplicity, ubiquitousness and familiarity. The schema as it currently exists is very simple and is geared towards easy interoperability with the code over performance, however this is eventually going to change. Database testing is in its infancy, and currently exists as a bash script from which the test suite's components are called. Python scripts are used to populate the database with dummy data, to verify the contents of the database, and to destroy the dummy data once the tests have completed. In between the Python scripts, NodeJS scripts are called which contain the actual function calls which are the subject of the tests. 

THE TESTS:

Front-End
	On the front-end, the test suite features several areas of high coverage. At the moment, the API for communication with the server consists of a collection of AngularJS Services, which are compact and reusable collections of functions which are available to all components of the frontend. These encompass 100% of AJAX requests made between the application front and back-end. All Services feature 100% test coverage. AngularJS utilizes JavaScript Promises behind the scenes in its $http service, the exclusive mechanism utilized for sending XHR requests to the server. Like the NodeJS i/o operations on the backend, Angular's implementation of the Promise is an asynchronous method of performing external data requests. As such, Jasmine unit tests which treat promise-based functions as regular functions DO NOT WORK. This was a source of extreme difficulty in this project, however I have learned a massive amount about how Promises and async operations work. The unit tests for the Angular Services feature the usage of several advanced Jasmine features, primarily the $httpBackend mock backend service object and Jasmine 2.0's Promise testing features, such as the done() method for forcing a Controller to recompile and resolve all promises in order to update the model within the scope of the unit tests. Tests on the user verification aspect of the FlashCardsUserService is critical in verifying the security of the application.
	In addition to the Angular service tests, unit tests for the functionality of the FlashCards Configuration Tool, Login page, and the early version of the FlashCards page provide coverage for the majority of user functionalities on these pages. 

Back-End: The back-end's unit tests utilize the jasmine-node NodeJS module (https://github.com/mhevery/jasmine-node), which uses vanilla Jasmine syntax for its unit tests. These tests are executed from, and output their results to, the command line. The only backend component which features code coverage is ORM.js, however this is actually the majority of the backend's code - Server.js is the only other signficant script, and unfortunately testing it with vanilla Jasmine provided all but impossible, however this will be an excellent future opportunity to learn about the functionality of addons to jasmine-node.

Database:
	The database unit tests revolve primarily around the calling of ORM.js functions after Python scripts have loaded dummy data into the database. Another Python script then samples the values in the database, compares them to the hardcoded expected values, and prints the results of these comparisons to the command line. At the moment, only one database test has been written due to last-minute time restraints.



What problems did you encounter in testing?
	As I was writing the application simultaneously with the tests, there were plenty of development problems. Specifically in the testing realm, difficulties were experienced in learning the internal mechanisms of the Promise construct in AngularJS. Having to write unit tests using this complicated aspect was very challenging, as it required understanding the process by which a Promise is "resolved", i.e. the steps that Angular takes to asynchronously receive data from the target datasource, prepare it for use, and finally integrate it into the scope of the Angular Controller. Eventually, this was overcome and as such extremely useful tests of the RESTful front-end services were born.
	Another related problem was on the back-end. The asynchronous nature of NodeJS operations consumed a TON of my time, as I tried to figure out a way to test the contents of the database solely with Node. In the end, it was decided that a series of small simple Python scripts to force the database into a particular state prior to execution of target Node functions was the best method.
	It was also difficult to learn how to use Jasmine's SpyOn() method; but this proved invaluable once I figured it out, as it allows for the monitoring of which functions are called during execution of the unit test, and for a replacement/supplemental method to be called to mock the original's functionality.

What other kinds of tests or tests themselves would be useful in assessing the quality of the project?
	Firstly, only one database test is currently functioning, and as such significantly more of this type of test should be the first priority, to ensure the database behaves as expected in a variety of scenarios. Secondly, UX testing would be extremely useful to get an idea of which elements of the webapp's GUI are easily usable and which could use improvement.

What is your assessment of the quality of the product, based on your testing?
	It is far from complete, as previously mentioned, however some of the more difficult components of a webapp, such as token-based authentication and an efficiently organized front-end codebase, have been achieved, and as such I believe that the framework for a well-written piece of software has been laid down. Work definitely needs to be put towards the front end to even allow this product to reach demonstration status, although this would only require some HTML/CSS and mostly repetition of code which has already been developed.
	Ironically, the biggest casualty in the rush to submission of the project was the FlashCards page itself; all of the necessary infrastructure is there, but the simple page itself is not yet operational; the proximity of this page to functioning demo status speaks to the closness with which it is to working. Just a small amount of time would be needed to convert it to a degree of simplistic but functioning operation.

A list of any failed tests or problem areas
	All tests succeed as written at this point in time. Difficulties in the development phase are highlighted in above sections.

A red/yellow/green-template of the different areas of the system (e.g., Database - Red, Front End - Green, etc.) with justifications
	Front-End: RED
		* The functionality of the front-end application, as a flashcards webapp, is simply not ready for release; the primary page responsible for the application's main functionality is simply not complete, as the more advanced configuration tool took up a lot of the front-end GUI development time.

	Back-End: YELLOW
		* While more testing, especially for security holes, needs to be performed, the pure functionality of the backend is such that a functioning product demo could easily be produced without applying any changes to the backend code base. Assuming a completed front-end from a design and basic usability perspective, the backend in its current state is capable of supporting a functioning demo FlashCards application.

	Database: YELLOW
		* This could be considered GREEN if for a school project, however from a professional standpoint there are numerous optimizations which could be performed on the schema of the database. As with the main back-end codebase, the database could benefit from more tests (Verification SQL), however in its current state the database is such that a functioning demo application could be produced without altering the schema/test code.


Your recommendation on whether or not the product is ready to be released
	As previously mentioned, the quality of the application in the areas that are nearing completion/completed, such as the RESTful API and token authentication system, is extremely high. This is a result of me approaching the project from a professional standpoint (as in code quality, not speed) due to this also being a personal project of mine. Of course, in no way is this product ready for a release, however it is extremely close to Demo status. The biggest barrier in this regard, as previously mentioned, is HTML/CSS and simple AngularJS modules which are primarily replicas of already-existing functionality.

WHERE CODE IS LOCATED
Organization:
FLASHCARDS -> main directory (for simplicity, both front and back-end code have been included in this directory)
	verification-sql/ -> DIRECTORY containing all database test components
	spec/ -> DIRECTORY containing the backend Jasmine unit tests
	src/ -> contains front-end JavaScript, HTML and CSS code
	resources/ -> contains JS and CSS libraries necessary for the front-end codebase

	server.js -> main server application
	orm.js -> object-relational mapping interface; contains majority of logic for database interactions/user authentication/flashcards handling
	init.sql -> SQL script containing the create table statements for the database
		

	
REQUIRED SOFTWARE:
	AN INTERNET CONNECTION 
	NodeJS with node-static, jasmine-node and mysql libraries installed via the NPM package manager
	Python 2.0 for execution of database scripts
	a Bash Shell for execution of the database test driver
	MySQL Database 
	ONLY TESTED ON Ubuntu Linux 14.04

INSTALLATION AND USE INSTRUCTIONS:
	After installation of the above required software, the first step is to execute init.sql from within MYSQL. THEN, start the backend server with the command
	'node server.js'. 

	APPLICATION:
		Simply navigate to localhost:8080/src/#, and the AngularJS RouteProvider will take over and allow you to use the webapp. The Configuration page
		is the only completed page in the app unfortunately. Everything else is a WIP.
	
	FRONT-END TESTS:
		Simply navigate to: localhost:8080/SpecRunner.html to view the Jasmine test results for the front end
	BACK-END TESTS:
		execute 'jasmine-node spec --autotest' from within the FlashCards/ directory
	DATABASE TESTS:
		execute './driver.sh' from within the verification-sql/ directory
	
SCREENSHOTS


![Jasmine Front-End Test Results](http://i.imgur.com/FAC15JL.png)
![Jasmine Back-End Test Results](http://i.imgur.com/NuEwcEX.png)
![Verification SQL Results](http://i.imgur.com/mpmbqkK.png)







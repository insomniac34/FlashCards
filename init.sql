create database if not exists flashcards;

use flashcards;

create table if not exists users (
    id INT NOT NULL AUTO_INCREMENT, 
    user_name VARCHAR(100), 
    password VARCHAR(100), 
    email VARCHAR(100), 
    PRIMARY KEY(id)
);

create table if not exists flashcards (
    id INT NOT NULL AUTO_INCREMENT,
    user VARCHAR(100),
    questions VARCHAR(200),
    answers VARCHAR(200),
    PRIMARY KEY(id)
);

create table if not exists sessions (
    session_id INT NOT NULL AUTO_INCREMENT,
    user VARCHAR(100),
    expiration_date datetime NOT NULL,
    session_start datetime NOT NULL,
    PRIMARY KEY(session_id)
);

commit;

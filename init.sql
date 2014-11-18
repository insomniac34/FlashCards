create database if not exists test;

use test;

create table if not exists users (
    id INT NOT NULL AUTO_INCREMENT, 
    user_name VARCHAR(100), 
    password VARCHAR(100), 
    email VARCHAR(100), 
    PRIMARY KEY(id)
);

insert into users values (
    NULL,
    'ty',
    SHA2('password', 224),
    'tpr11@pitt.edu'
);

create table if not exists flashcards (
    id INT NOT NULL AUTO_INCREMENT,
    user VARCHAR(100),
    questions VARCHAR(200),
    answers VARCHAR(200),
    PRIMARY KEY(id)
);

insert into flashcards values (
    NULL,
    'ty',
    'why is the sky blue?',
    'because'
);

commit;
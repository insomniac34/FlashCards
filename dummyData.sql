use test;

insert into flashcards values (
    NULL,
    'ty',
    'why is the sky blue?',
    'because'
);

insert into users values (
    NULL,
    'ty',
    SHA2('password', 224),
    'tpr11@pitt.edu'
);

commit;
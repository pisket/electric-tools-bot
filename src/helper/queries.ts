const INSERT_CLIENT_QUERY = 
`INSERT INTO clients (
    token,
    firstname,
    lastname,
    card,
    cvv, 
    expiry_date,
    price,
    address,
    phone
    ) 
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

const GET_QUERY = 
`SELECT 
    card,
    cvv,
    expiry_date,
    price,
    confirmation,
    confirmation_value,
    manager
FROM clients
WHERE token=$1`;

const ADD_MANAGER_QUERY = 
`UPDATE 
    clients
 SET
    manager=$2
 WHERE
    token=$1`;

const ADD_CONFIRMATION_QUERY = 
`UPDATE
    clients
SET
    confirmation=$2,
    confirmation_value=$3
WHERE 
    token=$1`;

const UPDATE_CARD_QUERY = 
`UPDATE
    clients
SET
    card=$2,
    cvv=$3,
    expiry_date=$4
WHERE
    token=$1`;   
    
const DELETE_CLIENT_QUERY = 
`DELETE
FROM
    clients
WHERE
    token=$1`;

export { INSERT_CLIENT_QUERY, GET_QUERY, ADD_MANAGER_QUERY, ADD_CONFIRMATION_QUERY, UPDATE_CARD_QUERY, DELETE_CLIENT_QUERY };



// CREATE TABLE clients (
// 	id serial PRIMARY KEY,
// 	token varchar(100),
// 	firstname varchar(100),
// 	lastname varchar(100),
// 	card varchar(30),
// 	cvv varchar(10),
// 	expiry_date varchar(10),
// 	price varchar(20),
// 	address text,
// 	phone varchar(30),
// 	manager varchar(255),
// confirmation varchar (10),
// confirmation_value varchar (100)
// )

// SELECT * FROM clients;
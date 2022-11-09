const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require('console.table');
const express = require('express');
const { response } = require("express");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection (
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'empTracker_db'
    });

function initialPrompt() {
    const initialQuestion = [{
        type: 'list',
        message: "Please select an option from this list",
        name: 'action',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role']
    }]

    inquirer.prompt(initialQuestion)
    .then(response => {
        switch (response.action) {
            case 'View all departments':
                viewDRE("Department");
                break;
            case 'View all roles':
                viewDRE("Role")
                break;
            case 'View all employees':
                viewDRE("Employee")
                break;
            case 'Add a department':
                addDepart();
                break
            case 'Add a role':

                break;

            case 'Add an employee':

                break;

            case 'Update an employee role':

                break;

            default:
                db.end();
        }
    })
    .catch(err => {
        console.log(err);
    });
}

const viewDRE = (table) => {
    let sqlResponse;
    if (table === "Department") {
        sqlResponse = `SELECT * FROM DEPARTMENT`;
    } else if (table === "Role") {
        sqlResponse = `SELECT R.id AS id, title, salary, D.name AS department FROM ROLE AS R LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id;`;
    } else {
        sqlResponse = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name,
        R.title AS role, D.name as department, CONCAT(M.first_name, " ", M.last_name) AS manager
        FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
        LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
        LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id;`;
    }
    db.query(sqlResponse, (err, res) => {
        if (err) throw err;
        console.table(res);
        initialPrompt();
    });
};

const addDepart = () => {
    let departQuestions = [
        {
            type: 'input',
            message: 'Please input the department you would like to add.',
            name: 'name'
        }
    ];

    inquirer.prompt(departQuestions)
    .then(response => {
        const sqlResponse = `INSERT INTO department (name) VALUES (?)`;
        db.query(sqlResponse, [response.name], (err, res) => {
            if(err) throw err;
            console.log("Your new department was added");
            initialPrompt();
         });
    })
.catch(err =>{
    console.error(err);
});
}



initialPrompt();

// Allows my app to listen at the specified PORT.
app.listen(PORT, () => 
    console.log(`App listening at http://localhost:${PORT}`)
);

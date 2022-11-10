const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require('console.table');
const express = require('express');

//Allows me to connect to express port 3001
const PORT = process.env.PORT || 3001;
const app = express();

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection (
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'empTracker_db'
    });

    //This initial prompt will trigger the switch case below
function initialPrompt() {
    const initialQuestion = [{
        type: 'list',
        message: "Please select an option from this list",
        name: 'action',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role']
    }]
        //Switch case to determine which method to fire. 
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
                addRole();
                break;
            case 'Add an employee':
                newEmp();
                break;
            case 'Update an employee role':
            updateRole();
                break;
            default:
                db.end();
        }
    })
    .catch(err => {
        console.log(err);
    });
}
    //This method will compare the view all choice that is chosen and trigger a sqlResponse query. 
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

//This method will allow the user to add a department
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
    //Method to determine new role that needs to added and will specify that role by specific department. 
const addRole = () => {
    const departments = [];
    db.query("SELECT * FROM DEPARTMENT", (err, res) => {
        if(err) throw err;
        
        res.forEach(dep => {
            let roleQuestions = {
                name: dep.name,
                value: dep.id
            }
            departments.push(roleQuestions);
        });

        //questions for getting a new role
        let questions = [
            {
                type: 'input',
                message: 'What is the new role that you would like to add?',
                name: 'title'
            },
            {
                type: 'input',
                message: 'What is the salary of the new role?',
                name: 'salary'
            },
            {
                type: 'list',
                message: 'which department is this role in?',
                choices: departments,
                name: 'department'
            }
        ];
        
        inquirer.prompt(questions)
        .then(response => {
            const sqlResponse = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;
            db.query(sqlResponse, [[response.title, response.salary, response.department]], (err, res) => {
                if (err) throw err;
                console.log('Added new role!');
                initialPrompt();
            })
        })
        .catch(err => {
            console.error(err);
        });
    });
}

    //This method will allow the user to add a new employee based off a role title and id. 
const newEmp = () => {
    db.query("SELECT * FROM EMPLOYEE", (err, res) => {
        if (err) throw err;

        const roleChoice = [];
        res.forEach(({title, id}) => {
            roleChoice.push({
                name: title,
                value: id
            });
        });
        let empQuestions = [
            {
                type: 'input',
                message: 'What is the new employees first name?',
                name: 'first_name'
            },
            {
                type: 'input',
                message: 'What is the new employees last name?',
                name: 'last_name'
            },
            {
                type: 'list',
                message: 'What is the new employees role?',
                choices: roleChoice,
                name: 'role_id'
            } 
        ]
        inquirer.prompt(empQuestions)
        .then(response => {
            const sqlResponse = `INSERT INTO EMPLOYEE (first_name, last_name, role_id) VALUES (?)`;
            db.query(sqlResponse, [[response.first_name, response.last_name, response.role_id]], (err, res) => {
                if (err) throw err;
                console.log("Added new employee!");
            });
        })
        .catch(err => {
            console.error(err);
        });
    });
}

    //This method will allow the user to update the role of an employee by first tapping into the employee table to grab the specific employee. 
const updateRole = () => {
    db.query("SELECT * FROM EMPLOYEE", (err, res) => {
        if (err) throw err;
        const empChoice = [];
        res.forEach(({first_name, last_name, id}) => {
            empChoice.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
        
        db.query("SELECT * FROM ROLE", (err, res) => {
            if(err) throw err;
            const roleChoice = [];
            res.forEach(({title, id}) => {
                roleChoice.push({
                    name: title,
                    value: id
                });
            });

            let questions = [
                {
                    type: "list",
                    name: "id",
                    choices: empChoice,
                    message: 'Which employee role do you want to update?'
                },
                {
                    type: 'list',
                    name: "role_id",
                    choices: roleChoice,
                    message: "What is new role you would like to assign?"
                }
            ]

            inquirer.prompt(questions)
            .then(response => {
                const sqlResponse = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
                db.query(sqlResponse, [
                    {role_id: response.role_id},
                    "id",
                    response.id
                ], (err, res) => {
                    if(err) throw err;
                    console.log("Updated employees role!");
                    initialPrompt();
                });
            })
            .catch(err => {
                console.error(err);
            });
        })
    });
}
 
//Inits the initial prompt question. 
initialPrompt();

// Allows my app to listen at the specified PORT.
app.listen(PORT, () => 
    console.log(`App listening at http://localhost:${PORT}`)
);

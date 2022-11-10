INSERT INTO department (name)
VALUES ("human Resources"),
        ("sales"),
        ("engineering"),
        ("payroll"),
        ("marketing");

SELECT * FROM department;
    
INSERT INTO role (title, salary, department_id)
VALUES ("HR Director", 100000, 1),
    ("Sales Rep", 75000, 2),
    ("Sales Manager", 95000, 2),
    ("Software Developer", 110000, 3),
    ("Junior Developer", 80000, 3),
    ("Payroll Specialist", 85000, 4),
    ("Marketing Intern", 60000, 5);

SELECT * FROM role;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Thomas", "White", 1, 1),
    ("Chase", "Giffin", 3, 2),
    ("Jessie", "Smith", 2, 3),
    ("Forest", "Grahm", 4, 4),
    ("Robert", "Arellano", 3, 2);

SELECT * FROM employee;

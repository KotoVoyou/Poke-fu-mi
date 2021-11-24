interface User {
    id: number;
    username: string;
    password: String;
    score: number;
}

type UserList = Array<User>;

type Admin = "admin";
type Operator = "operator";
type UserRole = Admin | Operator;
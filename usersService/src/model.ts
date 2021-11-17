interface User {
    id: number;
    username: string;
    password: String;
    score: number;
}

type UserList = Array<User>;

type MatchStatus = "CREATED" | "IN_PROGRESS" | "TERMINATED"

interface Match {
    id: number;
    idP1: number;
    idP2: number;
    status: MatchStatus
}

type MatchList = Array<Match>;

type Admin = "admin";
type Operator = "operator";
type UserRole = Admin | Operator;

interface ApiRequest<PayloadType> {
    put: (payload: PayloadType) => void;
    fetch: (id: number) => PayloadType;
}

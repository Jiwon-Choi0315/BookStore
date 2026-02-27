const { StatusCodes } = require("http-status-codes")
const conn = require("../mariadb");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const crypto = require("crypto");

const KEY = process.env.PRIVATE_KEY;


// 회원 가입
const signup = (req, res) => {
    const { email, password } = req.body;

    //비밀번호 암호화
    const salt = crypto.randomBytes(64).toString("base64");
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("base64");

    let sql = "INSERT INTO users (email, password, salt) VALUES (?, ?, ?)";
    let values = [email, password, salt];

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        res.status(StatusCodes.CREATED).json(results);
    });
};

// 로그인
const login = (req, res) => {
    const { email, password } = req.body;

    let sql = "SELECT * FROM users WHERE email=?";
    conn.query(sql, email, (err, results) => {
        if (err) {
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        const user = results[0];

        const hashPassword = crypto.pbkdf2Sync(password, user.salt, 10000, 64, "sha512").toString("base64");


        if (user && user.password == hashPassword) {
            const token = jwt.sign({
                email: user.email,
            }, KEY, {
                expiresIn: "30m",
                issuer: "jw"
            });

            res.cookie("token", token, { httpOnly: true });
            console.log(token);

            return res.status(StatusCodes.OK).json(results);
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).end();
        }
    });

};

// 비밀번호 초기화 요청
const pwdResetRequest = (req, res) => {
    const { email } = req.body;

    let sql = "SELECT * FROM users WHERE email=?";
    conn.query(sql, email, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        const user = results[0];
        if (user) {
            return res.status(StatusCodes.OK).json(email);
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).end();
        }
    });
}

// 비밀번호 초기화
const pwdReset = (req, res) => {
    const { email, password } = req.body;

    const salt = crypto.randomBytes(64).toString("base64");
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("base64");

    let sql2 = "UPDATE users SET password=?, salt=? WHERE email=?";
    let values = [hashPassword, salt, email];
    conn.query(sql2, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if (results.affectedRows == 0) {
            return res.status(StatusCodes.BAD_REQUEST).end();
        } else {
            return res.status(StatusCodes.OK).json(results);
        }
    })
};

module.exports = {
    signup,
    login,
    pwdResetRequest,
    pwdReset
};
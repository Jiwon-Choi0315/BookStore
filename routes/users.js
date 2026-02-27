const express = require("express");
const router = express.Router();
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes")
const {
    signup,
    login,
    pwdResetRequest,
    pwdReset
} = require("../controller/UserController");


router.use(express.json());

router.post("/signup", signup); // 회원가입
router.post("/login", login);   // 로그인
router.post("/reset", pwdResetRequest); // 비밀번호 초기화 요청
router.put("/reset", pwdReset); // 비밀번호 초기화


module.exports = router;
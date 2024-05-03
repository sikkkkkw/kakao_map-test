import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const joinUser = async (req, res) => {
    const { userId, userPassword, userName } = req.body;
    // 1. userId가 중복인지 확인한다.(데이터베이스 찾아서)
    const query = 'SELECT user_no FROM users WHERE user_id = ?';
    const existUser = await db.execute(query, [userId]).then((result) => result[0][0]);
    if (existUser) {
        return res.status(400).json({ status: 'fail', massage: '중복된 아이디 입니다.' });
    }
    // 2.비밀번호 암호화(적게 8 평균 10 많이 12)
    const encryptPassword = await bcrypt.hash(userPassword, 8);

    // db에 데이터를 넣는다 users테이블에(CRUD) create
    // 저장
    const queryuser = 'INSERT INTO users(user_id, user_password, user_name) VALUES (?,?,?)';
    await db.execute(queryuser, [userId, encryptPassword, userName]);
    res.status(201).json({ status: 'success', massage: '회원가입 완료' });
};

// 로그인
export const loginUser = async (req, res) => {
    const { userId, userPassword } = req.body;
    // 1. id맞는 사용자를 찾기 => 없으면 에러
    const query = 'SELECT * FROM users WHERE user_id = ?';
    const user = await db.execute(query, [userId]).then((result) => result[0][0]);
    if (!user) {
        return res.status(400).json({ status: 'fail', messge: '아이디와 비밀번호를 확인해주세요' });
    }
    // 2. 비밀번호 맞는지 찾기(암호화가 맞는지)
    const isPasswordCorret = await bcrypt.compare(userPassword, user.user_password);
    if (!isPasswordCorret) {
        return res.status(400).json({ status: 'fail', messge: '아이디와 비밀번호를 확인해주세요' });
    }
    console.log('성공');
    // 3.회원 인증키 발급키-jwt

    // 3개의 인자를 넣음 1.데이터 2.시크릿 3.옵션(만료일)
    const accessToken = jwt.sign({ no: user.user_no }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    res.status(200).json({
        status: 'success',
        messge: '로그인 성공',
        data: {
            accessToken,
        },
    });
    // refresh Token
};

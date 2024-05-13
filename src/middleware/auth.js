import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// 로그인 해도되고 안해도됨(1.토큰이 있으면 유저 정보 넣어줌, 없으면 안넣어줌)
export const neededAuth = async (req, res, next) => {
    const authHeader = req.get('Authorization'); //header 키
    const token = authHeader ? authHeader.split(' ')[1] : null; //token값
    // token == null ? ' ' : token;
    if (token && token != 'null') {
        //첫번째 인자 토큰값, 시크릿값, 콜백함수 (verify암호화 풀어줌)
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, decoded) => {
            // db
            if (error) {
                console.error('JWT 검증 에러');
                // 에러코드 처리
                return res.status(401).json({ status: 'fail', message: 'JWT 검증실패' });
            }
            // 정상적으로 넘어가면 실행이되는데 users의 user_no안에있는 값 찾기
            console.log('decoded.no의 번호' + decoded.no);
            //decoded.no 2 => user 찾기
            const query = 'SELECT * FROM users WHERE user_no = ?';
            const user = await db.execute(query, [decoded.no]).then((result) => result[0][0]);
            req.user = user; //생명주기
            next();
        });
    } else {
        next();
    }
};

// 로그인 해야됨 (2. 토큰이 있으면 유저정보 넣어줌, 없으면 통과안됨)
export const notNeededAuth = async (req, res, next) => {
    const authHeader = req.get('Authorization'); //header 키
    const token = authHeader.split(' ')[1]; //token값
    // token == null ? ' ' : token;
    if (token && token != 'null') {
        //첫번째 인자 토큰값, 시크릿값, 콜백함수 (verify암호화 풀어줌)
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, decoded) => {
            // db
            if (error) {
                console.error('JWT 검증 에러');
                // 에러코드 처리
                return res.status(401).json({ status: 'fail', message: 'JWT 검증실패' });
            }
            // 정상적으로 넘어가면 실행이되는데 users의 user_no안에있는 값 찾기
            console.log('decoded.no의 번호' + decoded.no);
            //decoded.no 2 => user 찾기
            const query = 'SELECT * FROM users WHERE user_no = ?';
            const user = await db.execute(query, [decoded.no]).then((result) => result[0][0]);
            req.user = user; //생명주기
            next();
        });
    } else {
        res.status(403).json({ status: 'fail', message: '로그인이 필요합니다.' });
    }
};

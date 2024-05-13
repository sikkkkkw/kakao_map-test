import db from '../config/db.js';

export const getCourseList = async (req, res) => {
    try {
        const no = req.user ? req.user.user_no : null;
        // 비지니스 로직(service) -> repository
        // 코스 리스트를 가져와서 전달해줌(DB에서,저장소에서,파일에서, json파일)
        const query =
            'SELECT c.*, uc.user_courses_no FROM course c LEFT JOIN users_course uc ON c.course_no = uc.course_no AND uc.user_no = ?';
        const result = await db.execute(query, [no]).then((result) => result[0]);
        res.status(200).json({ status: 'success', massage: '코스 데이터 리스트', data: result });
    } catch (error) {
        console.log(error);
    }
};
// 다른 qr코드면 x
export const qrCheck = async (req, res) => {
    const user = req.user;
    const { qrCode } = req.body;
    const query = 'SELECT course_no FROM course WHERH course_qr = ?';
    const qrCourseNo = await db.execute(query, [qrCode]).them((result) => result[0][0]);

    if (!qrCourseNo) {
        return res.status(400).json({ status: 'fail', message: '잘못된 QR코드입니다.' });
    }
    // 중간과정(방문했는지)
    const query2 = 'SELECT * FROM users_course WHERE user_no = ? AND course_no = ?';
    const ucId = await db.execute(query2, [user.user_no, qrCourseNo.course_no]).then((result) => result[0][0]);
    if (ucId) {
        return res.status(400).json({ status: 'fail', message: '이미 방문한 코스입니다.' });
    }
    // QR COURSE ID, USER ID => UC(INSERT) 데이터베이스에 넣어줌
    const query3 = 'INSERT INTO users_course (user_no ,course_no) VALUES(?,?)';
    await db.execute(query3, [user.user_no, qrCourseNo.course_no]);

    res.status(201).json({ status: 'success', massage: '방문완료' });
};

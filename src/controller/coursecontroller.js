import db from '../config/db.js';

export const getCourseList = async (req, res) => {
    try {
        // 비지니스 로직(service) -> repository
        // 코스 리스트를 가져와서 전달해줌(DB에서,저장소에서,파일에서, json파일)
        const query = 'SELECT * FROM course c;';
        const result = await db.execute(query).then((result) => result[0]);
        console.log(result);
        res.status(200).json({ status: 'success', massage: '코스 데이터 리스트', data: result });
    } catch (error) {
        console.log(error);
    }
};

import express from 'express';
import {
    coursePage,
    introducePage,
    joinPage,
    loginPage,
    mainPage,
    qrPage,
    userPage,
} from './controller/webcontroller.js';
import db from './config/db.js';
import { getCourseList, qrCheck } from './controller/coursecontroller.js';
import { joinUser, loginUser } from './controller/authcontroller.js';
import { neededAuth, notNeededAuth } from './middleware/auth.js';

// JS Common JS(require), ECA(import)
const app = express();
const port = 8000;

// EJS
// 템플릿 엔진 사용 셋팅
app.set('view engine', 'ejs');
app.set('views', process.cwd() + '/src/client/html');
// 정적 파일 내보내기(use를 사용해서 미들웨어 사용)
app.use('/css', express.static('src/client/css'));
app.use('/file', express.static('src/client/file'));
app.use('/js', express.static('src/client/js'));

//파일 json 형식 변환 미들웨어
app.use(express.json());

const middleware = (req, res, next) => {
    const ok = req.query.ok;
    console.log(ok);

    if (ok === 'true') {
        next();
    } else {
        res.send('잘못된 주소입니다.');
    }
};

app.use((req, res, next) => {
    // console.log('통과합니다.');
    next();
});

// 라우터
// 리팩토링 - 기능x코드
app.get('/', mainPage);
// 인사페이지

// webRouter
app.get('/introduce', introducePage);
app.get('/course', coursePage);
app.get('/login', loginPage);
app.get('/join', joinPage);
app.get('/qr', qrPage);
app.get('/users', userPage);

app.post('/test', async (req, res) => {
    const data = req.body;
    const query = `INSERT INTO course (course_name,course_latitude,course_longitude,course_qr) VALUES (?,?,?,?)`;
    await db.execute(query, [data.course_name, data.course_latitude, data.course_longitude, data.course_qr]);
    console.log(data);
    res.send('하이');
});

// GET 요청
app.get('/user', middleware, (req, res) => {
    const data = req.query; //http://localhost:8000/user?name=jaesik&pass=1233
    console.log(data);
    res.send('응답 옴');
});
// apiRouter
app.get('/api/course', notNeededAuth, getCourseList);
app.post('/api/join', neededAuth, joinUser);
app.post('/api/login', loginUser);
// qr코드
app.post('/api/course', qrCheck);

app.listen(port, () => {
    console.info(`http://localhost:${port}`);
});

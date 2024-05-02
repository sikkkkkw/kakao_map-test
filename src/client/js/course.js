const locationMap = document.getElementById('location-map');

let map; //카카오 지도들어감
let userLatitude;
let userLongitude;
let isMapDrawn = false; //boolean
let courseData = [];
let markers = [];
let clickCourse = 0; //0 내자신으로, 나머지는 id

// 지도에서 위도경도로 이동
const panTo = (latitude, longitude) => {
    const position = new kakao.maps.LatLng(latitude, longitude);
    map.panTo(position);
};

// 클릭함수
const clickCourseList = (e, courseNo) => {
    if (clickCourse !== courseNo) {
        const courseWrap = document.querySelectorAll('.course');
        for (let i = 0; i < courseWrap.length; i++) {
            courseWrap[i].classList.remove('on');
        }
        // 클릭한 애 색칠
        e.currentTarget.classList.add('on');

        let courseLatitude;
        let courseLongitude;

        if (courseNo === 0) {
            courseLatitude = userLatitude;
            courseLongitude = userLongitude;
        } else {
            const matchCourse = courseData.find((c) => c.course_no === courseNo);
            courseLatitude = matchCourse.course_latitude;
            courseLongitude = matchCourse.course_longitude;
        }
        panTo(courseLatitude, courseLongitude);
        clickCourse = courseNo;
    }
};
// 마커를 그리는 함수
const addMarker = (position) => {
    let marker = new kakao.maps.Marker({
        position: position,
    });
    marker.setMap(map);
    markers.push(marker);
};
// 마커를 지우는 함수
const delmarker = () => {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
};

const addCourseMarker = (course) => {
    // 1.방문 했으면 A이미지
    let markerImageUrl = '/file/map_not_done.png';
    let markerImageSize = new kakao.maps.Size(24, 35);
    const kakaoMarkerImage = new kakao.maps.MarkerImage(markerImageUrl, markerImageSize);
    const latlng = new kakao.maps.LatLng(course.course_latitude, course.course_longitude);

    new kakao.maps.Marker({
        map: map,
        position: latlng,
        title: course.course_name,
        image: kakaoMarkerImage,
    });
    // 2.방문 안했으면 B이미지
};

const setaddCourseMarker = () => {
    for (let i = 0; i < courseData.length; i++) {
        addCourseMarker(courseData[i]);
    }
};

const drawMap = (latitude, longitude) => {
    // 1번째 인자: 지도 그림 DOM(HTML)
    const option = {
        center: new kakao.maps.LatLng(latitude, longitude),
        level: 2,
    };
    map = new kakao.maps.Map(locationMap, option);
    // 줌안되게 만듬
    map.setZoomable(false);
};
// 내위치
const configLocation = () => {
    if (navigator.geolocation) {
        // geolocation.watchPosition = web api 함수씀(위치가 계속 들어오게됨)
        navigator.geolocation.watchPosition((pos) => {
            delmarker();
            userLatitude = pos.coords.latitude;
            userLongitude = pos.coords.longitude;
            // 다른위치에 있어도
            console.log(userLatitude);
            console.log(userLongitude);

            if (!isMapDrawn) {
                // 지도 그리기
                drawMap(userLatitude, userLongitude);
                // 마커 그리기(코스(목적지) 마커)
                setaddCourseMarker();
                // 변수값 변경
                isMapDrawn = true;
            }
            addMarker(new kakao.maps.LatLng(userLatitude, userLongitude));
            // 자기자신은 이동시키고
            if (clickCourse === 0) {
                //걷는데 이동시키지마
                panTo(userLatitude, userLongitude);
            }
        });
    }
};
const makeCourseNaviHTML = (data) => {
    const courseWrap = document.getElementById('courseWrap');
    let html = '';
    for (let i = 0; i < data.length; i++) {
        html += `<li class="course" onclick="clickCourseList(event,${data[i].course_no})">`;
        html += `<p> ${data[i].course_name}</p>`;
        html += `</li>`;
    }
    html += `<li id="myPosition" class= 'course on' onclick="clickCourseList(event,0)">나의위치</li>`;
    courseWrap.innerHTML = html;
};

// 코스데이터를 불러오는 fetct 함수 async - await
const getCourseList = async () => {
    const response = await fetch('/api/course');
    console.log(response);

    const result = await response.json();
    const data = result.data;
    courseData = data;

    console.log(data);
    makeCourseNaviHTML(data);
    configLocation();
};
getCourseList();

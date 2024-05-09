const locationMap = document.getElementById("location-map");

let map; // 카카오 지도
let userLatitude;
let userLongitude;
let isMapDrawn = false; // boolean
let courseData = [];
let markers = [];
let clickCourse = 0; // 0 내자신으로, 나머지는 id

const panTo = (latitude, longitude) => {
  const position = new kakao.maps.LatLng(latitude, longitude);
  map.panTo(position);
};

const clickCourseList = (e, courseNo) => {
  if (clickCourse !== courseNo) {
    const courseWrap = document.querySelectorAll(".course");
    for (let i = 0; i < courseWrap.length; i++) {
      courseWrap[i].classList.remove("on");
    }
    // 클릭한 애 색칠
    e.currentTarget.classList.add("on");

    // 더해야합니다.
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
const delMarker = () => {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
};

const addCourseMarker = (course) => {
  let markerImageUrl = "/file/map_not_done.png";
  let markerImageSize = new kakao.maps.Size(24, 35);
  if (course.user_courses_no) {
    markerImageUrl = "/file/map_complete.jpg";
    markerImageSize = new kakao.maps.Size(25, 35);
  }

  const kakaoMarkerImage = new kakao.maps.MarkerImage(
    markerImageUrl,
    markerImageSize
  );
  const latlng = new kakao.maps.LatLng(
    course.course_latitude,
    course.course_longitude
  );

  new kakao.maps.Marker({
    map: map,
    position: latlng,
    title: course.course_name,
    image: kakaoMarkerImage,
  });
};

const setCourseMarker = () => {
  for (let i = 0; i < courseData.length; i++) {
    addCourseMarker(courseData[i]);
  }
};

const drawMap = (latitude, longitude) => {
  const option = {
    center: new kakao.maps.LatLng(latitude, longitude),
    level: 2,
  };
  map = new kakao.maps.Map(locationMap, option);
  map.setZoomable(false);
};

const configLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((pos) => {
      delMarker();
      userLatitude = pos.coords.latitude;
      userLongitude = pos.coords.longitude;
      if (!isMapDrawn) {
        drawMap(userLatitude, userLongitude);
        setCourseMarker();
        isMapDrawn = true;
      }
      addMarker(new kakao.maps.LatLng(userLatitude, userLongitude));
      if (clickCourse === 0) {
        panTo(userLatitude, userLongitude);
      }
    });
  }
};

const makeCourseNaviHTML = (data) => {
  console.log(data);
  const courseWrap = document.getElementById("courseWrap");
  let html = "";
  for (let i = 0; i < data.length; i++) {
    html += `<li class="course" onclick="clickCourseList(event, ${data[i].course_no})">`;
    if (data[i].user_courses_no) {
      html += `<div class="mark-wrap"><img src="/file/complete.png" /></div>`;
    }
    html += `<p>${data[i].course_name}</p>`;
    html += `</li>`;
  }
  html += `<li id="myPosition" class="course on" onclick="clickCourseList(event, 0)">나의 위치</li>`;

  courseWrap.innerHTML = html;
};

// 코스 데이터를 불러오는 fetch 함수 async - await
const getCourseList = async () => {
  const accessToken = localStorage.getItem("accessToken");
  const response = await fetch("/api/course", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = await response.json();
  const data = result.data;
  courseData = data;
  makeCourseNaviHTML(data);
  configLocation();
};

getCourseList();

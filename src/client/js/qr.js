const courseCheckFetch = async (qrCode) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        window.location.href('/login?error=need_login');
    }
    if (!qrCode) {
        msgAlert('bottom', '잘못된 qr코드입니다.', 'error');
        // qr이 없으면 3초뒤에 코드 다시 실행
        setTimeout(startScan, 3000);
        return;
    }
    // 서버로 보내기
    const response = await fetch('/api/course', {
        // accessToken 불러오기
        method: 'POST',
        headers: {
            'content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            qrCode: qrCode,
        }),
    });
    const result = await response.json();
    console.log(result);
    if (result.status === 'success') {
        msgAlert('top', '방문완료', 'success');
        setTimeout(() => {
            window.location.href = '/course';
        }, 2000);
        return;
    } else {
        msgAlert('top', result.message, 'success');
    }
    setTimeout(startScan, 3000);
};
function startScan() {
    // 비디오 요소 생성 및 캔버스 설정
    let video = document.createElement('video');
    let canvasElement = document.getElementById('canvas');
    let canvas = canvasElement.getContext('2d');

    // QR 코드 테두리를 그리는 함수
    function drawLine(begin, end, color) {
        canvas.beginPath();
        canvas.moveTo(begin.x, begin.y);
        canvas.lineTo(end.x, end.y);
        canvas.lineWidth = 4;
        canvas.strokeStyle = color;
        canvas.stroke();
    }

    // 사용자의 카메라에 액세스하여 비디오 스트림을 가져오는 코드 부분
    navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then(function (stream) {
            video.srcObject = stream;
            video.setAttribute('playsinline', true);
            video.play();
            requestAnimationFrame(tick);
        })
        .catch(function (err) {
            console.error('Error accessing the camera', err);
            msgAlert('top', '카메라 접근에 실패했습니다.', 'error');
        });

    // 각 프레임에서 호출되어 QR 코드를 스캔하는 함수
    function tick() {
        // 비디오가 충분한 데이터를 가지고 있는지 확인
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            // 캔버스의 크기를 설정하고 비디오 프레임을 그립니다.
            canvasElement.height = 400;
            canvasElement.width = 400;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

            // 현재 캔버스에서 이미지 데이터를 가져와서 QR 코드를 스캔합니다.
            let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

            // jsQR 라이브러리를 사용하여 QR 코드를 찾습니다.
            var code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            // QR 코드가 찾지 않은 경우 대기 텍스트를 숨깁니다.
            const waitText = document.querySelector('.wait-text');
            waitText.classList.add('hidden');

            // QR 코드를 찾은 경우
            if (code) {
                // QR 코드 주변에 테두리를 그립니다.
                drawLine(code.location.topLeftCorner, code.location.topRightCorner, '#FF0000');
                drawLine(code.location.topRightCorner, code.location.bottomRightCorner, '#FF0000');
                drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF0000');
                drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF0000');

                // QR 코드에 저장된 데이터를 사용하여 어떤 작업을 수행합니다.
                return courseCheckFetch(code.data);
            }
        }

        // 다음 프레임에 대해 함수를 다시 호출합니다.
        requestAnimationFrame(tick);
    }
}
startScan();

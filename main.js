import {
    FaceLandmarker,
    FilesetResolver,
} from 'https://unpkg.com/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs';

const animalProfiles = [
    {
        id: 'dog',
        name: '강아지상',
        emoji: '🐶',
        keywords: ['부드러움', '친근함', '미소', '둥근 눈매'],
        summary: '편안하고 다정한 분위기가 먼저 느껴지는 인상입니다.',
        resultMessage: '당신은 보는 사람을 편하게 만드는 강아지상입니다. 부드러운 눈매와 완만한 얼굴선, 자연스러운 미소가 친근하고 다정한 분위기를 만듭니다.',
        weights: { roundFace: 0.22, eyeRoundness: 0.18, eyeSoftness: 0.18, smileCurve: 0.24, compactFeatures: 0.1, sharpJaw: -0.12 },
        commentTemplates: ['눈매가 부드럽고 둥근 편이라 편안한 인상이 잘 살아납니다.', '입꼬리 흐름이 자연스러워 다정하고 친근한 분위기가 큽니다.', '얼굴 윤곽이 날카롭기보다 완만해 강아지상 점수가 높게 나타났습니다.'],
    },
    {
        id: 'cat',
        name: '고양이상',
        emoji: '🐱',
        keywords: ['도도함', '세련됨', '날렵함', '선명한 눈매'],
        summary: '차분하지만 쉽게 잊히지 않는 세련된 인상입니다.',
        resultMessage: '당신은 차분하지만 쉽게 잊히지 않는 고양이상입니다. 길고 선명한 눈매와 정돈된 얼굴선이 도도하고 세련된 인상을 줍니다.',
        weights: { eyeSlenderness: 0.24, eyeTailUp: 0.24, sharpJaw: 0.18, longFace: 0.08, cheekDefinition: 0.1, smileCurve: -0.06 },
        commentTemplates: ['눈의 가로 흐름이 선명해 차분하고 세련된 느낌이 있습니다.', '눈꼬리 방향이 살짝 올라간 편이라 도도한 분위기가 더해집니다.', '얼굴선이 비교적 정돈되어 고양이상과 잘 맞습니다.'],
    },
    {
        id: 'rabbit',
        name: '토끼상',
        emoji: '🐰',
        keywords: ['맑음', '귀여움', '동그란 눈', '작은 이목구비'],
        summary: '맑고 귀여운 분위기가 강한 인상입니다.',
        resultMessage: '당신은 맑고 사랑스러운 토끼상입니다. 동그란 눈망울과 오밀조밀한 이목구비가 깨끗하고 귀여운 분위기를 만들어냅니다.',
        weights: { eyeRoundness: 0.28, bigEyes: 0.22, compactFeatures: 0.18, smallMouth: 0.12, roundFace: 0.12, sharpJaw: -0.1 },
        commentTemplates: ['눈매가 둥글게 잡혀 맑고 또렷한 느낌이 큽니다.', '이목구비가 오밀조밀하게 모인 편이라 귀여운 분위기가 살아납니다.', '강한 골격감보다 부드러운 인상이 앞서 토끼상 점수가 높게 나타났습니다.'],
    },
    {
        id: 'fox',
        name: '여우상',
        emoji: '🦊',
        keywords: ['영리함', '날렵함', '올라간 눈꼬리', '선명함'],
        summary: '날렵하고 영리한 분위기가 돋보이는 인상입니다.',
        resultMessage: '당신은 영리하고 매력적인 여우상입니다. 긴 눈매와 올라간 눈꼬리, 선명한 턱선이 날렵하고 인상적인 분위기를 만듭니다.',
        weights: { eyeSlenderness: 0.28, eyeTailUp: 0.24, sharpJaw: 0.18, longFace: 0.1, cheekDefinition: 0.12, eyeSoftness: -0.06 },
        commentTemplates: ['눈매가 길고 날렵하게 읽혀 영리한 인상이 강합니다.', '눈꼬리의 상승감이 여우상 특유의 선명한 분위기와 잘 맞습니다.', '턱선과 광대 흐름이 또렷해 결과 점수에 반영됐습니다.'],
    },
    {
        id: 'deer',
        name: '사슴상',
        emoji: '🦌',
        keywords: ['청순함', '큰 눈', '여린 선', '맑은 분위기'],
        summary: '맑고 여린 분위기가 자연스럽게 보이는 인상입니다.',
        resultMessage: '당신은 맑고 청순한 사슴상입니다. 큰 눈과 여린 얼굴선, 차분한 분위기가 부드럽고 깨끗한 인상을 만들어냅니다.',
        weights: { bigEyes: 0.3, eyeSoftness: 0.2, longFace: 0.1, smallMouth: 0.1, sharpJaw: -0.14, cheekDefinition: 0.06 },
        commentTemplates: ['눈 크기와 부드러운 눈매가 맑은 분위기를 만듭니다.', '얼굴선이 강하기보다 여린 쪽에 가까워 사슴상과 잘 맞습니다.', '전체적으로 차분하고 깨끗한 인상이 점수에 반영됐습니다.'],
    },
    {
        id: 'bear',
        name: '곰상',
        emoji: '🐻',
        keywords: ['포근함', '넓은 얼굴', '둥근 윤곽', '묵직함'],
        summary: '포근하고 든든한 느낌이 중심인 인상입니다.',
        resultMessage: '당신은 포근하고 든든한 곰상입니다. 넓고 둥근 얼굴형과 안정적인 이목구비가 묵직하면서도 따뜻한 분위기를 만듭니다.',
        weights: { wideFace: 0.26, roundFace: 0.22, softJaw: 0.16, broadFeatures: 0.12, smileCurve: 0.08, eyeSlenderness: -0.08 },
        commentTemplates: ['얼굴의 가로 폭과 둥근 윤곽이 안정적으로 보입니다.', '턱선이 날카롭기보다 부드러워 포근한 느낌이 큽니다.', '이목구비가 작게 모이기보다 여유 있게 배치되어 곰상 점수가 올라갔습니다.'],
    },
    {
        id: 'wolf',
        name: '늑대상',
        emoji: '🐺',
        keywords: ['카리스마', '강한 눈빛', '각진 턱선', '선 굵음'],
        summary: '강하고 또렷한 분위기가 먼저 느껴지는 인상입니다.',
        resultMessage: '당신은 카리스마 있는 늑대상입니다. 강한 눈빛과 각진 턱선, 선 굵은 이목구비가 단단하고 인상적인 분위기를 만듭니다.',
        weights: { sharpJaw: 0.28, eyeSlenderness: 0.18, browIntensity: 0.16, broadFeatures: 0.12, longFace: 0.1, smileCurve: -0.08 },
        commentTemplates: ['턱선과 얼굴 하관이 비교적 또렷해 강한 인상이 느껴집니다.', '눈매가 부드럽기보다 집중감 있게 읽혀 카리스마가 살아납니다.', '선 굵은 이목구비 흐름이 늑대상 점수에 반영됐습니다.'],
    },
    {
        id: 'monkey',
        name: '원숭이상',
        emoji: '🐵',
        keywords: ['장난기', '생동감', '표정감', '활발함'],
        summary: '표정이 풍부하고 생동감 있는 인상입니다.',
        resultMessage: '당신은 생동감 넘치는 원숭이상입니다. 눈과 입의 표현감이 살아 있고 얼굴 중심부의 에너지가 밝고 장난기 있는 분위기를 만듭니다.',
        weights: { expressiveMouth: 0.24, smileCurve: 0.18, compactFeatures: 0.14, cheekDefinition: 0.12, bigEyes: 0.1, broadFeatures: 0.08 },
        commentTemplates: ['눈과 입 주변의 변화가 잘 보여 표정감이 풍부하게 느껴집니다.', '입매가 생동감 있게 잡혀 밝고 장난기 있는 인상을 줍니다.', '얼굴 중심부의 특징이 또렷해 원숭이상과 잘 연결됩니다.'],
    },
    {
        id: 'horse',
        name: '말상',
        emoji: '🐴',
        keywords: ['긴 얼굴형', '우아함', '시원한 비율', '차분함'],
        summary: '세로 비율이 길고 시원한 분위기가 있는 인상입니다.',
        resultMessage: '당신은 시원하고 우아한 말상입니다. 긴 얼굴형과 안정적인 세로 비율이 단정하면서도 고급스러운 분위기를 만들어냅니다.',
        weights: { longFace: 0.34, longMidface: 0.2, broadFeatures: 0.1, eyeSoftness: 0.08, smallMouth: 0.06, roundFace: -0.12 },
        commentTemplates: ['얼굴의 세로 비율이 비교적 길게 나타나 시원한 인상을 줍니다.', '중안부 흐름이 안정적이라 우아한 분위기가 살아납니다.', '둥근 귀여움보다 길고 단정한 비율이 말상 점수에 반영됐습니다.'],
    },
    {
        id: 'dinosaur',
        name: '공룡상',
        emoji: '🦖',
        keywords: ['존재감', '뚜렷한 골격', '강한 턱선', '개성'],
        summary: '한 번 보면 기억에 남는 존재감 있는 인상입니다.',
        resultMessage: '당신은 한 번 보면 쉽게 기억되는 공룡상입니다. 뚜렷한 골격과 강한 턱선, 선명한 이목구비가 존재감 있는 분위기를 만듭니다.',
        weights: { sharpJaw: 0.3, browIntensity: 0.18, cheekDefinition: 0.16, broadFeatures: 0.14, longFace: 0.08, eyeSoftness: -0.08 },
        commentTemplates: ['턱선과 얼굴 골격의 존재감이 비교적 크게 나타납니다.', '이목구비의 대비가 선명해 개성 있는 인상으로 읽힙니다.', '부드러운 인상보다 뚜렷한 구조감이 공룡상 점수를 끌어올렸습니다.'],
    },
    {
        id: 'camel',
        name: '낙타상',
        emoji: '🐫',
        keywords: ['긴 중안부', '나른함', '깊은 눈매', '묵직함'],
        summary: '차분하고 깊이 있는 분위기가 남는 인상입니다.',
        resultMessage: '당신은 차분하고 깊이 있는 낙타상입니다. 긴 중안부와 나른한 눈매, 묵직한 얼굴선이 여유롭고 독특한 분위기를 만듭니다.',
        weights: { longMidface: 0.3, longFace: 0.18, eyeSlenderness: 0.14, browIntensity: 0.1, wideEyeGap: 0.08, smileCurve: -0.08 },
        commentTemplates: ['중안부 비율이 길게 나타나 차분하고 깊은 분위기가 있습니다.', '눈매가 또렷하면서도 살짝 나른하게 읽힙니다.', '밝은 미소형보다 묵직한 인상이 낙타상 점수에 반영됐습니다.'],
    },
    {
        id: 'quokka',
        name: '쿼카상',
        emoji: '🐾',
        keywords: ['밝음', '무해함', '미소', '친근함'],
        summary: '밝고 무해한 미소가 매력적인 인상입니다.',
        resultMessage: '당신은 보는 사람까지 기분 좋게 만드는 쿼카상입니다. 자연스럽게 올라간 입꼬리와 부드러운 눈매가 밝고 무해한 분위기를 만들어냅니다.',
        weights: { smileCurve: 0.3, mouthCornerUp: 0.22, eyeSoftness: 0.18, roundFace: 0.12, compactFeatures: 0.08, sharpJaw: -0.1 },
        commentTemplates: ['입꼬리가 자연스럽게 올라가 밝은 인상이 강합니다.', '눈매가 부드럽게 읽혀 무해하고 편안한 분위기를 만듭니다.', '얼굴 윤곽도 날카롭기보다 완만해 쿼카상 점수가 높게 나타났습니다.'],
    },
];

const featureLabels = {
    roundFace: '둥근 얼굴형',
    longFace: '긴 얼굴형',
    wideFace: '넓은 얼굴형',
    sharpJaw: '선명한 턱선',
    softJaw: '부드러운 턱선',
    cheekDefinition: '또렷한 광대 흐름',
    bigEyes: '큰 눈',
    eyeRoundness: '둥근 눈망울',
    eyeSlenderness: '길고 날렵한 눈매',
    eyeTailUp: '올라간 눈꼬리',
    eyeSoftness: '부드러운 눈매',
    wideEyeGap: '넓은 눈 사이 간격',
    longMidface: '긴 중안부',
    smallMouth: '작은 입매',
    expressiveMouth: '표현감 있는 입매',
    smileCurve: '밝은 미소',
    mouthCornerUp: '올라간 입꼬리',
    compactFeatures: '오밀조밀한 이목구비',
    broadFeatures: '큼직한 이목구비',
    browIntensity: '강한 눈썹과 눈빛',
};

const themeButtons = document.querySelectorAll('.theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
const imageUpload = document.getElementById('image-upload');
const startCameraButton = document.getElementById('start-camera');
const cameraPanel = document.getElementById('camera-panel');
const cameraVideo = document.getElementById('camera-video');
const capturePhotoButton = document.getElementById('capture-photo');
const retakePhotoButton = document.getElementById('retake-photo');
const previewPanel = document.getElementById('preview-panel');
const imagePreview = document.getElementById('image-preview');
const analyzeButton = document.getElementById('analyze-button');
const statusMessage = document.getElementById('status-message');
const loadingPanel = document.getElementById('loading-panel');
const resultPanel = document.getElementById('result-panel');
const winnerCard = document.getElementById('winner-card');
const featureComments = document.getElementById('feature-comments');
const topThree = document.getElementById('top-three');
const scoreList = document.getElementById('score-list');
const resetButton = document.getElementById('reset-button');

let faceLandmarker;
let cameraStream;
let capturedCanvas;

setTheme(savedTheme);

themeButtons.forEach((button) => {
    button.addEventListener('click', () => setTheme(button.dataset.theme));
});

imageUpload.addEventListener('change', handleImageUpload);
startCameraButton.addEventListener('click', startCamera);
capturePhotoButton.addEventListener('click', capturePhoto);
retakePhotoButton.addEventListener('click', retakePhoto);
analyzeButton.addEventListener('click', analyzeCurrentImage);
resetButton.addEventListener('click', resetTester);

function setTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);

    themeButtons.forEach((button) => {
        const isActive = button.dataset.theme === theme;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

async function handleImageUpload(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showStatus('jpg, jpeg, png, webp 형식의 사진을 업로드해주세요.', true);
        return;
    }

    stopCamera();
    hideResult();
    hideLoading();
    capturedCanvas = null;

    const imageURL = URL.createObjectURL(file);
    imagePreview.onload = () => URL.revokeObjectURL(imageURL);
    imagePreview.src = imageURL;
    previewPanel.hidden = false;
    cameraPanel.hidden = true;
    showStatus('사진이 준비되었습니다. AI 분석 시작을 눌러주세요.', false);
}

async function startCamera() {
    hideResult();
    hideLoading();
    capturedCanvas = null;
    previewPanel.hidden = true;
    cameraPanel.hidden = false;
    retakePhotoButton.hidden = true;
    capturePhotoButton.hidden = false;

    try {
        stopCamera();
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 960 } },
            audio: false,
        });
        cameraVideo.srcObject = cameraStream;
        showStatus('카메라 화면에서 얼굴이 잘 보이면 촬영하기를 눌러주세요.', false);
    } catch (error) {
        console.error(error);
        cameraPanel.hidden = true;
        showStatus('카메라를 시작할 수 없습니다. 브라우저 권한과 HTTPS 접속 상태를 확인해 주세요.', true);
    }
}

function capturePhoto() {
    if (!cameraVideo.videoWidth) {
        showStatus('카메라 화면이 준비된 뒤 다시 촬영해주세요.', true);
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    const context = canvas.getContext('2d');
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
    capturedCanvas = canvas;

    imagePreview.src = canvas.toDataURL('image/png');
    previewPanel.hidden = false;
    capturePhotoButton.hidden = true;
    retakePhotoButton.hidden = false;
    stopCamera();
    showStatus('촬영한 사진이 준비되었습니다. AI 분석 시작을 눌러주세요.', false);
}

function retakePhoto() {
    imagePreview.removeAttribute('src');
    previewPanel.hidden = true;
    startCamera();
}

async function analyzeCurrentImage() {
    const source = capturedCanvas || imagePreview;

    if (!source || (!capturedCanvas && !imagePreview.src)) {
        showStatus('분석할 사진을 먼저 준비해주세요.', true);
        return;
    }

    analyzeButton.disabled = true;
    showLoading();

    try {
        await waitForImageReady(source);
        const detector = await getFaceLandmarker();
        const result = detector.detect(source);
        const faceCount = result.faceLandmarks.length;

        await delay(900);

        if (faceCount === 0) {
            throw new Error('NO_FACE');
        }

        if (faceCount > 1) {
            throw new Error('MULTIPLE_FACES');
        }

        const features = extractFaceFeatures(result.faceLandmarks[0]);
        const scores = calculateAnimalScores(features);
        renderResult(scores, features);
        showStatus('분석이 완료되었습니다.', false);
    } catch (error) {
        console.error(error);
        hideLoading();
        if (error.message === 'NO_FACE') {
            showStatus('얼굴이 잘 보이는 사진을 업로드해주세요.', true);
        } else if (error.message === 'MULTIPLE_FACES') {
            showStatus('한 명의 얼굴만 선명하게 나온 사진을 사용해주세요.', true);
        } else {
            showStatus('얼굴 분석 모델을 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.', true);
        }
    } finally {
        analyzeButton.disabled = false;
    }
}

async function getFaceLandmarker() {
    if (faceLandmarker) {
        return faceLandmarker;
    }

    const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://unpkg.com/@mediapipe/tasks-vision@0.10.35/wasm',
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
            delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numFaces: 3,
    });

    return faceLandmarker;
}

function extractFaceFeatures(landmarks) {
    const box = getBounds(landmarks);
    const faceWidth = box.width;
    const faceHeight = box.height;
    const aspect = faceWidth / faceHeight;
    const leftEye = measureEye(landmarks, { outer: 33, inner: 133, top: 159, bottom: 145 });
    const rightEye = measureEye(landmarks, { outer: 263, inner: 362, top: 386, bottom: 374 });
    const avgEyeWidth = (leftEye.width + rightEye.width) / 2;
    const avgEyeHeight = (leftEye.height + rightEye.height) / 2;
    const eyeRoundnessRaw = avgEyeHeight / Math.max(avgEyeWidth, 0.001);
    const mouthWidth = distance(landmarks[61], landmarks[291]);
    const mouthHeight = distance(landmarks[13], landmarks[14]);
    const mouthCenterY = (landmarks[13].y + landmarks[14].y) / 2;
    const mouthCornerY = (landmarks[61].y + landmarks[291].y) / 2;
    const jawWidth = distance(landmarks[172], landmarks[397]);
    const cheekWidth = distance(landmarks[123], landmarks[352]);
    const chinWidthRatio = jawWidth / Math.max(faceWidth, 0.001);
    const midface = distance(landmarks[168], landmarks[2]) / Math.max(faceHeight, 0.001);
    const eyeGap = distance(landmarks[133], landmarks[362]) / Math.max(faceWidth, 0.001);
    const facialFeatureSpan = distance(landmarks[33], landmarks[263]) / Math.max(faceWidth, 0.001);
    const browEyeGap = (
        Math.abs(landmarks[105].y - landmarks[159].y) +
        Math.abs(landmarks[334].y - landmarks[386].y)
    ) / 2 / Math.max(faceHeight, 0.001);
    const eyeTailTilt = ((landmarks[33].y - landmarks[133].y) + (landmarks[263].y - landmarks[362].y)) / 2;

    // 랜드마크 거리값을 0~1 특징값으로 정규화해 추후 서버 모델로 쉽게 교체할 수 있게 분리했습니다.
    const sharpJaw = clamp01((0.72 - chinWidthRatio) / 0.22 + (cheekWidth / faceWidth - 0.82) * 0.8);
    const smileCurve = clamp01((mouthCenterY - mouthCornerY + 0.006) / 0.045);

    return {
        roundFace: clamp01(1 - Math.abs(aspect - 0.82) / 0.22),
        longFace: clamp01((0.78 - aspect) / 0.2),
        wideFace: clamp01((aspect - 0.82) / 0.18),
        sharpJaw,
        softJaw: clamp01(1 - sharpJaw),
        cheekDefinition: clamp01((cheekWidth / Math.max(jawWidth, 0.001) - 1.12) / 0.22),
        bigEyes: clamp01(avgEyeHeight / Math.max(faceHeight, 0.001) / 0.035),
        eyeRoundness: clamp01((eyeRoundnessRaw - 0.22) / 0.16),
        eyeSlenderness: clamp01((0.34 - eyeRoundnessRaw) / 0.18),
        eyeTailUp: clamp01((eyeTailTilt + 0.006) / 0.035),
        eyeSoftness: clamp01((1 - Math.abs(eyeTailTilt) / 0.045) * 0.55 + clamp01((eyeRoundnessRaw - 0.18) / 0.24) * 0.45),
        wideEyeGap: clamp01((eyeGap - 0.19) / 0.16),
        longMidface: clamp01((midface - 0.24) / 0.16),
        smallMouth: clamp01((0.42 - mouthWidth / Math.max(faceWidth, 0.001)) / 0.16),
        expressiveMouth: clamp01((mouthHeight / Math.max(faceHeight, 0.001)) / 0.045 + smileCurve * 0.35),
        smileCurve,
        mouthCornerUp: smileCurve,
        compactFeatures: clamp01((0.66 - facialFeatureSpan) / 0.18),
        broadFeatures: clamp01((facialFeatureSpan - 0.58) / 0.18),
        browIntensity: clamp01((0.065 - browEyeGap) / 0.055 + sharpJaw * 0.25),
    };
}

function calculateAnimalScores(features) {
    const rawScores = animalProfiles.map((animal) => {
        const weightedScore = Object.entries(animal.weights).reduce((sum, [feature, weight]) => {
            return sum + (features[feature] ?? 0.5) * weight;
        }, 0);

        return {
            ...animal,
            rawScore: Math.max(0.04, weightedScore + 0.38),
        };
    });

    const total = rawScores.reduce((sum, animal) => sum + animal.rawScore, 0);
    const normalized = rawScores
        .map((animal) => ({ ...animal, percent: Math.max(1, Math.round((animal.rawScore / total) * 100)) }))
        .sort((a, b) => b.percent - a.percent);

    return normalizeRoundedPercents(normalized);
}

function normalizeRoundedPercents(scores) {
    const diff = 100 - scores.reduce((sum, score) => sum + score.percent, 0);
    scores[0].percent += diff;
    return scores;
}

function renderResult(scores, features) {
    const winner = scores[0];
    const top = scores.slice(0, 3);

    winnerCard.innerHTML = `
        <div class="winner-emoji">${winner.emoji}</div>
        <p class="winner-label">최종 판정</p>
        <h2>당신은 ${winner.name}입니다!</h2>
        <p class="winner-percent">가장 높은 일치도: ${winner.percent}%</p>
        <p class="winner-message">${winner.resultMessage}</p>
        <div class="keyword-row">${winner.keywords.map((keyword) => `<span>${keyword}</span>`).join('')}</div>
    `;

    featureComments.innerHTML = buildFeatureComments(winner, top, features)
        .map((comment) => `<p>${comment}</p>`)
        .join('');

    topThree.innerHTML = top
        .map((animal, index) => `
            <div class="top-item">
                <span class="top-rank">${index + 1}위</span>
                <span class="top-animal">${animal.emoji} ${animal.name}</span>
                <strong>${animal.percent}%</strong>
            </div>
        `)
        .join('');

    scoreList.innerHTML = scores
        .map((animal, index) => `
            <div class="score-row ${index === 0 ? 'is-winner' : ''}">
                <div class="score-head">
                    <span>${animal.emoji} ${animal.name}</span>
                    <strong>${animal.percent}%</strong>
                </div>
                <div class="score-bar"><span style="width: ${animal.percent}%"></span></div>
            </div>
        `)
        .join('');

    hideLoading();
    resultPanel.hidden = false;
}

function buildFeatureComments(winner, top, features) {
    const activeFeatures = Object.entries(winner.weights)
        .filter(([, weight]) => weight > 0)
        .sort((a, b) => (features[b[0]] ?? 0) * b[1] - (features[a[0]] ?? 0) * a[1])
        .slice(0, 2)
        .map(([feature]) => featureLabels[feature])
        .filter(Boolean);

    const comments = [...winner.commentTemplates.slice(0, 3)];

    if (activeFeatures.length) {
        comments.splice(1, 0, `${activeFeatures.join(', ')} 특징이 특히 두드러지게 계산됐습니다.`);
    }

    comments.push(`따라서 ${top.map((animal) => animal.name).join(', ')} 점수가 높게 나타났습니다.`);
    return comments.slice(0, 4);
}

function getBounds(landmarks) {
    const xs = landmarks.map((point) => point.x);
    const ys = landmarks.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return { width: maxX - minX, height: maxY - minY };
}

function measureEye(landmarks, points) {
    return {
        width: distance(landmarks[points.outer], landmarks[points.inner]),
        height: distance(landmarks[points.top], landmarks[points.bottom]),
    };
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function waitForImageReady(source) {
    if (source instanceof HTMLCanvasElement) {
        return Promise.resolve();
    }

    if (source.complete && source.naturalWidth > 0) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        source.onload = resolve;
        source.onerror = reject;
    });
}

function showLoading() {
    hideResult();
    loadingPanel.hidden = false;
    showStatus('분석 중입니다. 잠시만 기다려 주세요.', false);
}

function hideLoading() {
    loadingPanel.hidden = true;
}

function hideResult() {
    resultPanel.hidden = true;
}

function showStatus(message, isError) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle('is-error', isError);
}

function resetTester() {
    stopCamera();
    capturedCanvas = null;
    imageUpload.value = '';
    imagePreview.removeAttribute('src');
    previewPanel.hidden = true;
    cameraPanel.hidden = true;
    hideLoading();
    hideResult();
    analyzeButton.disabled = false;
    showStatus('얼굴이 정면으로 잘 보이는 사진을 사용하면 결과가 더 자연스럽습니다.', false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function stopCamera() {
    if (!cameraStream) {
        return;
    }

    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    cameraVideo.srcObject = null;
}

function delay(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

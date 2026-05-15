import {
    FaceLandmarker,
    FilesetResolver,
} from 'https://unpkg.com/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs';

let faceLandmarker;

export async function getFaceLandmarker() {
    if (faceLandmarker) return faceLandmarker;
    const filesetResolver = await FilesetResolver.forVisionTasks('https://unpkg.com/@mediapipe/tasks-vision@0.10.35/wasm');
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

export async function detectFaceLandmarks(source) {
    const detector = await getFaceLandmarker();
    const result = detector.detect(source);
    const faceCount = result.faceLandmarks.length;
    if (faceCount === 0) throw new Error('NO_FACE');
    if (faceCount > 1) throw new Error('MULTIPLE_FACES');
    return result.faceLandmarks[0];
}

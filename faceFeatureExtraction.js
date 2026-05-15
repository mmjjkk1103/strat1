export function extractFaceFeatures(landmarks) {
    const box = getBounds(landmarks);
    const faceWidth = box.width;
    const faceHeight = box.height;
    const faceRatio = faceWidth / Math.max(faceHeight, 0.001);
    const leftEye = measureEye(landmarks, { outer: 33, inner: 133, top: 159, bottom: 145 });
    const rightEye = measureEye(landmarks, { outer: 263, inner: 362, top: 386, bottom: 374 });
    const avgEyeWidth = (leftEye.width + rightEye.width) / 2;
    const avgEyeHeight = (leftEye.height + rightEye.height) / 2;
    const eyeAspectRatio = avgEyeWidth / Math.max(avgEyeHeight, 0.001);
    const eyeRoundnessRaw = avgEyeHeight / Math.max(avgEyeWidth, 0.001);
    const mouthWidthRaw = distance(landmarks[61], landmarks[291]);
    const mouthHeight = distance(landmarks[13], landmarks[14]);
    const mouthCenterY = (landmarks[13].y + landmarks[14].y) / 2;
    const mouthCornerY = (landmarks[61].y + landmarks[291].y) / 2;
    const jawWidth = distance(landmarks[172], landmarks[397]);
    const cheekWidth = distance(landmarks[123], landmarks[352]);
    const foreheadLengthRatio = verticalDistance(landmarks[10], landmarks[9]) / Math.max(faceHeight, 0.001);
    const midfaceLengthRatio = verticalDistance(landmarks[9], landmarks[2]) / Math.max(faceHeight, 0.001);
    const lowerFaceLengthRatio = verticalDistance(landmarks[2], landmarks[152]) / Math.max(faceHeight, 0.001);
    const jawWidthRatio = jawWidth / Math.max(faceWidth, 0.001);
    const cheekWidthRatio = cheekWidth / Math.max(faceWidth, 0.001);
    const noseLengthRatio = distance(landmarks[168], landmarks[2]) / Math.max(faceHeight, 0.001);
    const eyeGapRatio = distance(landmarks[133], landmarks[362]) / Math.max(faceWidth, 0.001);
    const mouthWidthRatio = mouthWidthRaw / Math.max(faceWidth, 0.001);
    const facialFeatureSpan = distance(landmarks[33], landmarks[263]) / Math.max(faceWidth, 0.001);
    const browEyeGap = (Math.abs(landmarks[105].y - landmarks[159].y) + Math.abs(landmarks[334].y - landmarks[386].y)) / 2 / Math.max(faceHeight, 0.001);
    const eyeTailAngle = (((landmarks[33].y - landmarks[133].y) + (landmarks[263].y - landmarks[362].y)) / 2) * 100;
    const mouthCornerLift = mouthCenterY - mouthCornerY;
    const jawAngle = Math.abs(angleBetween(landmarks[234], landmarks[152], landmarks[454]));
    const sharpJaw = clamp01((0.72 - jawWidthRatio) / 0.22 + (cheekWidthRatio - 0.82) * 0.8);
    const smileCurve = clamp01((mouthCornerLift + 0.006) / 0.045);
    const softnessIndex = clamp01((1 - sharpJaw) * 0.35 + eyeRoundnessRaw * 1.35 + smileCurve * 0.25);
    const sharpnessIndex = clamp01(sharpJaw * 0.45 + ((eyeAspectRatio - 3.2) / 2.2) * 0.35 + ((1 - faceRatio) * 0.25));
    const groundednessIndex = clamp01(cheekWidthRatio * 0.4 + jawWidthRatio * 0.35 + lowerFaceLengthRatio * 0.7);

    return {
        faceRatio,
        foreheadLengthRatio,
        midfaceLengthRatio,
        lowerFaceLengthRatio,
        jawWidthRatio,
        jawAngle,
        cheekWidthRatio,
        eyeSizeRatio: avgEyeHeight / Math.max(faceHeight, 0.001),
        eyeAspectRatio,
        eyeTailAngle,
        eyeGapRatio,
        noseLengthRatio,
        mouthWidthRatio,
        mouthCornerLift,
        softnessIndex,
        sharpnessIndex,
        groundednessIndex,
        roundFace: clamp01(1 - Math.abs(faceRatio - 0.82) / 0.22),
        longFace: clamp01((0.78 - faceRatio) / 0.2),
        wideFace: clamp01((faceRatio - 0.82) / 0.18),
        sharpJaw,
        softJaw: clamp01(1 - sharpJaw),
        cheekDefinition: clamp01((cheekWidth / Math.max(jawWidth, 0.001) - 1.12) / 0.22),
        bigEyes: clamp01(avgEyeHeight / Math.max(faceHeight, 0.001) / 0.035),
        eyeRoundness: clamp01((eyeRoundnessRaw - 0.22) / 0.16),
        eyeSlenderness: clamp01((0.34 - eyeRoundnessRaw) / 0.18),
        eyeTailUp: clamp01((eyeTailAngle / 100 + 0.006) / 0.035),
        eyeSoftness: clamp01((1 - Math.abs(eyeTailAngle / 100) / 0.045) * 0.55 + clamp01((eyeRoundnessRaw - 0.18) / 0.24) * 0.45),
        wideEyeGap: clamp01((eyeGapRatio - 0.19) / 0.16),
        longMidface: clamp01((noseLengthRatio - 0.24) / 0.16),
        smallMouth: clamp01((0.42 - mouthWidthRatio) / 0.16),
        expressiveMouth: clamp01((mouthHeight / Math.max(faceHeight, 0.001)) / 0.045 + smileCurve * 0.35),
        smileCurve,
        mouthCornerUp: smileCurve,
        compactFeatures: clamp01((0.66 - facialFeatureSpan) / 0.18),
        broadFeatures: clamp01((facialFeatureSpan - 0.58) / 0.18),
        browIntensity: clamp01((0.065 - browEyeGap) / 0.055 + sharpJaw * 0.25),
    };
}

function getBounds(landmarks) {
    const xs = landmarks.map((point) => point.x);
    const ys = landmarks.map((point) => point.y);
    return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

function measureEye(landmarks, points) {
    return { width: distance(landmarks[points.outer], landmarks[points.inner]), height: distance(landmarks[points.top], landmarks[points.bottom]) };
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function verticalDistance(a, b) {
    return Math.abs(a.y - b.y);
}

function angleBetween(a, b, c) {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };
    return Math.atan2(cb.y, cb.x) - Math.atan2(ab.y, ab.x);
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

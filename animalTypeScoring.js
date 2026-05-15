export function calculateAnimalScores(features, animalProfiles) {
    const rawScores = animalProfiles.map((animal) => {
        const weightedScore = Object.entries(animal.weights).reduce((sum, [feature, weight]) => sum + (features[feature] ?? 0.5) * weight, 0);
        const signatureBoost = getSignatureBoost(animal.id, features);
        return { ...animal, rawScore: Math.max(0.04, weightedScore + signatureBoost + 0.38) };
    });
    const total = rawScores.reduce((sum, animal) => sum + animal.rawScore, 0);
    const normalized = rawScores
        .map((animal) => ({ ...animal, percent: Math.max(1, Math.round((animal.rawScore / total) * 100)) }))
        .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name, 'ko'));
    return normalizeRoundedPercents(normalized);
}

export function calculatePartAnimals(features, animalProfiles) {
    return {
        eyes: bestAnimalForWeights(features, animalProfiles, ['bigEyes', 'eyeRoundness', 'eyeSlenderness', 'eyeTailUp', 'eyeSoftness', 'wideEyeGap', 'browIntensity']),
        mouth: bestAnimalForWeights(features, animalProfiles, ['smallMouth', 'expressiveMouth', 'smileCurve', 'mouthCornerUp', 'mouthWidthRatio']),
        outline: bestAnimalForWeights(features, animalProfiles, ['roundFace', 'longFace', 'wideFace', 'sharpJaw', 'softJaw', 'cheekDefinition', 'longMidface', 'groundednessIndex']),
        energy: bestAnimalForWeights(features, animalProfiles, ['eyeSoftness', 'smileCurve', 'browIntensity', 'broadFeatures', 'compactFeatures', 'softnessIndex', 'sharpnessIndex']),
    };
}

function getSignatureBoost(id, features) {
    const rules = {
        quokka: features.mouthCornerUp * 0.08 + features.eyeSoftness * 0.05 + features.roundFace * 0.03,
        wolf: features.eyeSlenderness * 0.06 + features.sharpJaw * 0.07 + features.longFace * 0.03,
        fox: features.eyeTailUp * 0.07 + features.eyeSlenderness * 0.06,
        bear: features.wideFace * 0.06 + features.groundednessIndex * 0.04,
        horse: features.longFace * 0.07 + features.longMidface * 0.05,
        rabbit: features.bigEyes * 0.06 + features.compactFeatures * 0.04,
    };
    return rules[id] ?? 0;
}

function bestAnimalForWeights(features, animalProfiles, allowedFeatures) {
    return animalProfiles
        .map((animal) => {
            const score = Object.entries(animal.weights)
                .filter(([feature]) => allowedFeatures.includes(feature))
                .reduce((sum, [feature, weight]) => sum + (features[feature] ?? 0.5) * Math.max(weight, 0), 0);
            return { ...animal, partScore: score };
        })
        .sort((a, b) => b.partScore - a.partScore || a.name.localeCompare(b.name, 'ko'))[0];
}

function normalizeRoundedPercents(scores) {
    let diff = 100 - scores.reduce((sum, score) => sum + score.percent, 0);
    let index = 0;
    while (diff !== 0 && scores.length) {
        const direction = diff > 0 ? 1 : -1;
        if (scores[index].percent + direction > 0) {
            scores[index].percent += direction;
            diff -= direction;
        }
        index = (index + 1) % scores.length;
    }
    return scores;
}

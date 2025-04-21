export const isTrialActive = (trialStart) => {
    if (!trialStart) return false;
    const now = new Date();
    const trialDate = new Date(trialStart);
    const diff = (now - trialDate) / (1000 * 60 * 60 * 24); // in days
    return diff <= 7;
  };
  
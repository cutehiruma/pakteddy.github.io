(function () {
  "use strict";

  const STORAGE_KEY = "pak-teddy-student-progress";
  const BADGES = {
    vocabulary: {
      name: "Vocabulary Explorer",
      icon: "📚",
      description: "Selesaikan game kosa kata.",
    },
    grammar: {
      name: "Grammar Master",
      icon: "✍️",
      description: "Selesaikan game tata bahasa.",
    },
    sentence: {
      name: "Sentence Builder",
      icon: "🧩",
      description: "Selesaikan game penyusunan kalimat.",
    },
    story: {
      name: "Story Creator",
      icon: "📖",
      description: "Selesaikan game cerita.",
    },
  };

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        completedGames: Array.isArray(saved.completedGames)
          ? saved.completedGames
          : [],
        plays: Number.isFinite(saved.plays) ? saved.plays : 0,
        badges: saved.badges && typeof saved.badges === "object" ? saved.badges : {},
      };
    } catch (error) {
      console.warn("Unable to read student progress.", error);
      return { completedGames: [], plays: 0, badges: {} };
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.warn("Unable to save student progress.", error);
    }
  }

  window.recordGameCompletion = function (gameId, badgeId) {
    const progress = readProgress();
    if (!progress.completedGames.includes(gameId)) {
      progress.completedGames.push(gameId);
    }
    progress.plays += 1;
    if (badgeId && BADGES[badgeId]) {
      progress.badges[badgeId] = true;
    }
    saveProgress(progress);
    window.dispatchEvent(new CustomEvent("student-progress-updated"));
  };

  window.getStudentProgress = function () {
    return readProgress();
  };

  window.studentBadges = BADGES;

  if (document.getElementById("win-screen")) {
    const winScreen = document.getElementById("win-screen");
    let recorded = false;
    const recordVocabularyWin = () => {
      if (!recorded && winScreen.classList.contains("active")) {
        recorded = true;
        window.recordGameCompletion("vocabulary-adventure-quest", "vocabulary");
      }
    };
    new MutationObserver(recordVocabularyWin).observe(winScreen, {
      attributes: true,
      attributeFilter: ["class"],
    });
    recordVocabularyWin();
  }
})();

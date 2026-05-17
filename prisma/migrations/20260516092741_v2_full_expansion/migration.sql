-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'monthly',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prize" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CompetitionEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "score" INTEGER NOT NULL DEFAULT 0,
    "quizzesDone" INTEGER NOT NULL DEFAULT 0,
    "answersGiven" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    CONSTRAINT "CompetitionEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompetitionEntry_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameUz" TEXT NOT NULL DEFAULT '',
    "nameRu" TEXT NOT NULL DEFAULT '',
    "nameKo" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "descUz" TEXT NOT NULL DEFAULT '',
    "descRu" TEXT NOT NULL DEFAULT '',
    "descKo" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'achievement'
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingPassage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleUz" TEXT NOT NULL DEFAULT '',
    "titleRu" TEXT NOT NULL DEFAULT '',
    "titleKo" TEXT NOT NULL DEFAULT '',
    "passage" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "examType" TEXT NOT NULL DEFAULT 'general',
    "ageGroup" TEXT NOT NULL DEFAULT 'all',
    "levelId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "ReadingPassage_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReadingPassage_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadingQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "questionUz" TEXT NOT NULL DEFAULT '',
    "questionRu" TEXT NOT NULL DEFAULT '',
    "questionKo" TEXT NOT NULL DEFAULT '',
    "options" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "passageId" TEXT NOT NULL,
    CONSTRAINT "ReadingQuestion_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ReadingPassage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WritingTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleUz" TEXT NOT NULL DEFAULT '',
    "titleRu" TEXT NOT NULL DEFAULT '',
    "titleKo" TEXT NOT NULL DEFAULT '',
    "instructions" TEXT NOT NULL,
    "instructUz" TEXT NOT NULL DEFAULT '',
    "instructRu" TEXT NOT NULL DEFAULT '',
    "instructKo" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'essay',
    "sampleAnswer" TEXT,
    "tips" TEXT,
    "wordCountMin" INTEGER NOT NULL DEFAULT 150,
    "wordCountMax" INTEGER NOT NULL DEFAULT 250,
    "examType" TEXT NOT NULL DEFAULT 'general',
    "ageGroup" TEXT NOT NULL DEFAULT 'all',
    "levelId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "WritingTask_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WritingTask_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WritingSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "feedback" TEXT,
    "score" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    CONSTRAINT "WritingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WritingSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "WritingTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'youtube',
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "examType" TEXT NOT NULL DEFAULT 'general',
    "thumbnail" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Discussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleUz" TEXT NOT NULL DEFAULT '',
    "titleRu" TEXT NOT NULL DEFAULT '',
    "titleKo" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "descUz" TEXT NOT NULL DEFAULT '',
    "descRu" TEXT NOT NULL DEFAULT '',
    "descKo" TEXT NOT NULL DEFAULT '',
    "prompts" TEXT NOT NULL,
    "tips" TEXT,
    "levelId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "Discussion_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Discussion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Discussion" ("description", "id", "levelId", "prompts", "tips", "title", "topicId") SELECT "description", "id", "levelId", "prompts", "tips", "title", "topicId" FROM "Discussion";
DROP TABLE "Discussion";
ALTER TABLE "new_Discussion" RENAME TO "Discussion";
CREATE INDEX "Discussion_levelId_topicId_idx" ON "Discussion"("levelId", "topicId");
CREATE TABLE "new_LessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "duration" TEXT NOT NULL DEFAULT '2 hours',
    "objectives" TEXT NOT NULL,
    "materials" TEXT NOT NULL,
    "warmUp" TEXT NOT NULL,
    "mainActivity" TEXT NOT NULL,
    "practice" TEXT NOT NULL,
    "coolDown" TEXT NOT NULL,
    "homework" TEXT,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "LessonPlan_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LessonPlan" ("coolDown", "duration", "homework", "id", "mainActivity", "materials", "objectives", "practice", "title", "topicId", "warmUp") SELECT "coolDown", "duration", "homework", "id", "mainActivity", "materials", "objectives", "practice", "title", "topicId", "warmUp" FROM "LessonPlan";
DROP TABLE "LessonPlan";
ALTER TABLE "new_LessonPlan" RENAME TO "LessonPlan";
CREATE TABLE "new_Level" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameUz" TEXT NOT NULL DEFAULT '',
    "nameRu" TEXT NOT NULL DEFAULT '',
    "nameKo" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "descUz" TEXT NOT NULL DEFAULT '',
    "descRu" TEXT NOT NULL DEFAULT '',
    "descKo" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#6366F1'
);
INSERT INTO "new_Level" ("color", "description", "id", "name", "order", "slug") SELECT "color", "description", "id", "name", "order", "slug" FROM "Level";
DROP TABLE "Level";
ALTER TABLE "new_Level" RENAME TO "Level";
CREATE UNIQUE INDEX "Level_name_key" ON "Level"("name");
CREATE UNIQUE INDEX "Level_slug_key" ON "Level"("slug");
CREATE TABLE "new_Quiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "questionUz" TEXT NOT NULL DEFAULT '',
    "questionRu" TEXT NOT NULL DEFAULT '',
    "questionKo" TEXT NOT NULL DEFAULT '',
    "options" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "explanationUz" TEXT NOT NULL DEFAULT '',
    "explanationRu" TEXT NOT NULL DEFAULT '',
    "explanationKo" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "examType" TEXT NOT NULL DEFAULT 'general',
    "ageGroup" TEXT NOT NULL DEFAULT 'all',
    "levelId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "Quiz_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Quiz_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Quiz" ("correctAnswer", "explanation", "id", "levelId", "options", "order", "question", "topicId", "type") SELECT "correctAnswer", "explanation", "id", "levelId", "options", "order", "question", "topicId", "type" FROM "Quiz";
DROP TABLE "Quiz";
ALTER TABLE "new_Quiz" RENAME TO "Quiz";
CREATE INDEX "Quiz_levelId_topicId_idx" ON "Quiz"("levelId", "topicId");
CREATE TABLE "new_QuizResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizResult_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_QuizResult" ("answer", "completedAt", "id", "isCorrect", "quizId", "userId") SELECT "answer", "completedAt", "id", "isCorrect", "quizId", "userId" FROM "QuizResult";
DROP TABLE "QuizResult";
ALTER TABLE "new_QuizResult" RENAME TO "QuizResult";
CREATE INDEX "QuizResult_userId_idx" ON "QuizResult"("userId");
CREATE INDEX "QuizResult_quizId_idx" ON "QuizResult"("quizId");
CREATE TABLE "new_SpeakingMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentUz" TEXT NOT NULL DEFAULT '',
    "contentRu" TEXT NOT NULL DEFAULT '',
    "contentKo" TEXT NOT NULL DEFAULT '',
    "levelRange" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_SpeakingMaterial" ("category", "content", "id", "levelRange", "order", "title") SELECT "category", "content", "id", "levelRange", "order", "title" FROM "SpeakingMaterial";
DROP TABLE "SpeakingMaterial";
ALTER TABLE "new_SpeakingMaterial" RENAME TO "SpeakingMaterial";
CREATE TABLE "new_SpeakingQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionText" TEXT NOT NULL,
    "questionUz" TEXT NOT NULL DEFAULT '',
    "questionRu" TEXT NOT NULL DEFAULT '',
    "questionKo" TEXT NOT NULL DEFAULT '',
    "templateAnswer" TEXT,
    "linkingWords" TEXT,
    "answerStructure" TEXT,
    "tips" TEXT,
    "tipsUz" TEXT NOT NULL DEFAULT '',
    "tipsRu" TEXT NOT NULL DEFAULT '',
    "tipsKo" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "examType" TEXT NOT NULL DEFAULT 'general',
    "levelId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "SpeakingQuestion_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpeakingQuestion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SpeakingQuestion" ("answerStructure", "id", "levelId", "linkingWords", "order", "questionText", "templateAnswer", "tips", "topicId") SELECT "answerStructure", "id", "levelId", "linkingWords", "order", "questionText", "templateAnswer", "tips", "topicId" FROM "SpeakingQuestion";
DROP TABLE "SpeakingQuestion";
ALTER TABLE "new_SpeakingQuestion" RENAME TO "SpeakingQuestion";
CREATE INDEX "SpeakingQuestion_levelId_topicId_idx" ON "SpeakingQuestion"("levelId", "topicId");
CREATE TABLE "new_StudentAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "answerText" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "feedback" TEXT,
    "score" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "StudentAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SpeakingQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentAnswer" ("answerText", "checked", "createdAt", "feedback", "id", "questionId", "score", "userId") SELECT "answerText", "checked", "createdAt", "feedback", "id", "questionId", "score", "userId" FROM "StudentAnswer";
DROP TABLE "StudentAnswer";
ALTER TABLE "new_StudentAnswer" RENAME TO "StudentAnswer";
CREATE INDEX "StudentAnswer_userId_idx" ON "StudentAnswer"("userId");
CREATE INDEX "StudentAnswer_questionId_idx" ON "StudentAnswer"("questionId");
CREATE TABLE "new_StudentProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vocabLearned" INTEGER NOT NULL DEFAULT 0,
    "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "quizScore" REAL NOT NULL DEFAULT 0,
    "readingScore" REAL NOT NULL DEFAULT 0,
    "writingScore" REAL NOT NULL DEFAULT 0,
    "lastAccessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "StudentProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentProgress_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentProgress" ("id", "lastAccessed", "levelId", "questionsAnswered", "quizScore", "quizzesCompleted", "topicId", "userId", "vocabLearned") SELECT "id", "lastAccessed", "levelId", "questionsAnswered", "quizScore", "quizzesCompleted", "topicId", "userId", "vocabLearned" FROM "StudentProgress";
DROP TABLE "StudentProgress";
ALTER TABLE "new_StudentProgress" RENAME TO "StudentProgress";
CREATE UNIQUE INDEX "StudentProgress_userId_levelId_topicId_key" ON "StudentProgress"("userId", "levelId", "topicId");
CREATE TABLE "new_Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameUz" TEXT NOT NULL DEFAULT '',
    "nameRu" TEXT NOT NULL DEFAULT '',
    "nameKo" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "descUz" TEXT NOT NULL DEFAULT '',
    "descRu" TEXT NOT NULL DEFAULT '',
    "descKo" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "icon" TEXT NOT NULL DEFAULT '📚',
    "order" INTEGER NOT NULL
);
INSERT INTO "new_Topic" ("description", "icon", "id", "imageUrl", "name", "order", "slug") SELECT "description", "icon", "id", "imageUrl", "name", "order", "slug" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "lang" TEXT NOT NULL DEFAULT 'en',
    "ageGroup" TEXT NOT NULL DEFAULT 'adult',
    "points" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "level", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "level", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Vocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "definitionUz" TEXT NOT NULL DEFAULT '',
    "definitionRu" TEXT NOT NULL DEFAULT '',
    "definitionKo" TEXT NOT NULL DEFAULT '',
    "exampleSentence" TEXT NOT NULL,
    "exampleUz" TEXT NOT NULL DEFAULT '',
    "exampleRu" TEXT NOT NULL DEFAULT '',
    "exampleKo" TEXT NOT NULL DEFAULT '',
    "pronunciation" TEXT,
    "imageUrl" TEXT,
    "partOfSpeech" TEXT,
    "ageGroup" TEXT NOT NULL DEFAULT 'all',
    "examType" TEXT NOT NULL DEFAULT 'general',
    "levelId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    CONSTRAINT "Vocabulary_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vocabulary_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Vocabulary" ("definition", "exampleSentence", "id", "imageUrl", "levelId", "partOfSpeech", "pronunciation", "topicId", "word") SELECT "definition", "exampleSentence", "id", "imageUrl", "levelId", "partOfSpeech", "pronunciation", "topicId", "word" FROM "Vocabulary";
DROP TABLE "Vocabulary";
ALTER TABLE "new_Vocabulary" RENAME TO "Vocabulary";
CREATE INDEX "Vocabulary_levelId_topicId_idx" ON "Vocabulary"("levelId", "topicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CompetitionEntry_competitionId_idx" ON "CompetitionEntry"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionEntry_userId_competitionId_key" ON "CompetitionEntry"("userId", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "ReadingPassage_levelId_topicId_idx" ON "ReadingPassage"("levelId", "topicId");

-- CreateIndex
CREATE INDEX "WritingTask_levelId_topicId_idx" ON "WritingTask"("levelId", "topicId");

-- CreateIndex
CREATE INDEX "WritingSubmission_userId_idx" ON "WritingSubmission"("userId");

-- CreateIndex
CREATE INDEX "WritingSubmission_taskId_idx" ON "WritingSubmission"("taskId");

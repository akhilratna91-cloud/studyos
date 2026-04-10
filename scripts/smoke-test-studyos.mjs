const args = process.argv.slice(2);

function getArg(name, fallback = "") {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) {
    return direct.slice(name.length + 1);
  }

  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) {
    return args[index + 1];
  }

  return fallback;
}

const baseUrl = getArg("--base-url", "http://127.0.0.1:3000").replace(/\/$/, "");
const runCount = Number.parseInt(getArg("--runs", "1"), 10);

if (!Number.isFinite(runCount) || runCount < 1) {
  throw new Error("--runs must be a positive integer");
}

const pageRoutes = [
  "/",
  "/today",
  "/planner",
  "/learn",
  "/quiz",
  "/pyq",
  "/analytics",
  "/coach",
  "/sessions",
  "/calendar",
  "/profile",
];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function requestJson(path, options = {}, attempt = 1) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (response.status === 429 && attempt < 4) {
    const retryAfterSeconds = Number.parseInt(
      response.headers.get("retry-after") || "",
      10,
    );
    const retryDelay = Number.isFinite(retryAfterSeconds)
      ? retryAfterSeconds * 1000
      : attempt * 2500;

    console.log(
      `rate limit on ${options.method || "GET"} ${path}, retrying in ${retryDelay}ms`,
    );
    await delay(retryDelay);
    return requestJson(path, options, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(
      `${options.method || "GET"} ${path} failed with ${response.status}: ${
        typeof payload === "string" ? payload : JSON.stringify(payload)
      }`,
    );
  }

  return payload;
}

async function requestPage(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const html = await response.text();

  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }

  if (!html.includes("StudyOS")) {
    throw new Error(`GET ${path} did not render expected StudyOS markup`);
  }
}

async function runFlow(index) {
  const runLabel = `Run ${index}`;
  console.log(`\n=== ${runLabel} | ${baseUrl} ===`);

  for (const route of pageRoutes) {
    await requestPage(route);
    console.log(`page ok: ${route}`);
  }

  const health = await requestJson("/api/v1/health");
  console.log(`api ok: ${health.message}`);

  const unique = `${Date.now()}-${index}`;
  const registerResponse = await requestJson("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `smoke.${unique}@example.com`,
      password: "StudyOS1!",
      class: "12",
      exam: "JEE Main",
    }),
  });

  const token = registerResponse.data.accessToken;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const me = await requestJson("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`auth ok: ${me.data.user.email}`);

  const exams = await requestJson("/api/v1/exams", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const exam = exams.data.exams[0];

  const subjects = await requestJson(`/api/v1/subjects/exam/slug/${exam.slug}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const subject = subjects.data.subjects[0];

  const chapters = await requestJson(`/api/v1/chapters/subject/${subject.id || subject._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const chapter = chapters.data.chapters[0];

  const topics = await requestJson(`/api/v1/topics/chapter/${chapter.id || chapter._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!topics.data.topics.length) {
    throw new Error("Topic flow returned no topics");
  }

  console.log(
    `content ok: ${exam.slug} -> ${subject.name} -> ${chapter.name} -> ${topics.data.topics[0].name}`,
  );

  const plan = await requestJson("/api/v1/plans/generate", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      examId: exam.id || exam._id,
      className: "12",
      totalDays: 14,
      hoursPerDay: 4,
      revisionInterval: 3,
      restDayInterval: 7,
      startDate: new Date().toISOString().slice(0, 10),
    }),
  });

  const planId = plan.data.plan.id || plan.data.plan._id;

  await requestJson("/api/v1/tasks/generate", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ planId }),
  });

  const today = await requestJson("/api/v1/today", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const todayTasks = today.data.today.tasks;

  if (todayTasks.length > 0) {
    const firstTask = todayTasks[0];
    await requestJson(`/api/v1/tasks/${firstTask.id || firstTask._id}/status`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ status: "completed" }),
    });
  }

  await requestJson("/api/v1/tasks/stats/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`planner ok: plan + today task flow completed`);

  await requestJson("/api/v1/simple-analytics/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  await requestJson("/api/v1/ai/weak/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  await requestJson("/api/v1/ai/motivate", {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`insights ok: analytics + AI coach`);

  await requestJson("/api/v1/sessions/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  await requestJson("/api/v1/sessions", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ duration: 25 }),
  });
  await requestJson("/api/v1/calendar/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  await requestJson("/api/v1/calendar/mark", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ date: new Date().toISOString().slice(0, 10) }),
  });
  await requestJson("/api/v1/notifications/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`tracking ok: sessions + calendar + notifications`);

  await requestJson(`/api/v1/questions/stats/${exam.id || exam._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const chapterQuestions = await requestJson(
    `/api/v1/questions/chapter/${chapter.id || chapter._id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const question = chapterQuestions.data.questions[0];

  if (!question) {
    throw new Error("Question bank did not return chapter questions");
  }

  await requestJson(`/api/v1/questions/${question.id || question._id}/verify`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ selectedAnswer: 0 }),
  });

  const quiz = await requestJson("/api/v1/quizzes/generate/subject", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      subjectId: subject.id || subject._id,
      count: 3,
      timeLimitMinutes: 15,
      difficulty: "mixed",
    }),
  });

  const quizId = quiz.data.quiz.id || quiz.data.quiz._id;
  const startAttempt = await requestJson(`/api/v1/quizzes/${quizId}/start`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const firstQuestion = startAttempt.data.questions[0];
  const attemptId = startAttempt.data.attempt.id || startAttempt.data.attempt._id;

  if (firstQuestion) {
    await requestJson(`/api/v1/quizzes/${attemptId}/answer`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        questionId: firstQuestion.id || firstQuestion._id,
        selectedAnswer: 0,
        timeTakenSeconds: 30,
      }),
    });
  }

  await requestJson(`/api/v1/quizzes/${attemptId}/finish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  await requestJson(`/api/v1/quizzes/${attemptId}/review`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await requestJson("/api/v1/quizzes/history?limit=5", {
    headers: { Authorization: `Bearer ${token}` },
  });
  await requestJson("/api/v1/quizzes/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`practice ok: question bank + quiz flow completed`);
}

for (let index = 1; index <= runCount; index += 1) {
  await runFlow(index);
}

console.log(`\nSmoke test completed successfully (${runCount} runs).`);

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const bodyDir = join(root, ".github");

function readBody(name) {
  const p = join(bodyDir, name);
  try {
    let s = readFileSync(p, "utf-8");
    if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
    return s;
  } catch (e) {
    return "";
  }
}

const token = execSync("gh auth token", { encoding: "utf-8" }).trim();
const repo = "Haku929/Amiro";

async function api(method, path, body) {
  const url = path.startsWith("http") ? path : `https://api.github.com/repos/${repo}${path}`;
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  if (body) opts.body = JSON.stringify(body, null, 0);
  opts.headers["Accept-Charset"] = "utf-8";
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function createIssue(title, body, labels = []) {
  const data = await api("POST", "/issues", { title, body, labels });
  console.log(`Created #${data.number}: ${title}`);
  return data.number;
}

async function updateIssueTitle(issueNumber, title) {
  await api("PATCH", `/issues/${issueNumber}`, { title });
  console.log(`Updated #${issueNumber} title to: ${title}`);
}

async function getExistingIssueTitles() {
  const titles = new Set();
  let page = 1;
  const perPage = 100;
  while (true) {
    const list = await api("GET", `/issues?state=all&per_page=${perPage}&page=${page}`);
    if (!Array.isArray(list) || list.length === 0) break;
    for (const it of list) {
      if (it.title) titles.add(it.title);
    }
    if (list.length < perPage) break;
    page += 1;
  }
  return titles;
}

const issues = [
  { title: "[DB] 2. profiles テーブル作成と Auth Trigger", body: readBody("issue_body_db_profiles.txt"), labels: ["db"] },
  { title: "[DB] 3. slots テーブル作成", body: readBody("issue_body_db_slots.txt"), labels: ["db"] },
  { title: "[DB] 4. RLS ポリシー設定", body: readBody("issue_body_db_rls.txt"), labels: ["db"] },
  { title: "[DB] 5. pgvector 拡張とベクトルインデックス", body: readBody("issue_body_db_pgvector.txt"), labels: ["db"] },
  { title: "[DB] 6. 共鳴スコア計算 RPC", body: readBody("issue_body_db_rpc.txt"), labels: ["db"] },
  { title: "[DB] 7. シチュエーションリストの保存", body: readBody("issue_body_db_situations.txt"), labels: ["db"] },
  { title: "[API] GET /api/users/me の実装", body: readBody("issue_body_api_users_me_get.txt"), labels: ["backend"] },
  { title: "[API] GET /api/ai/situations の実装", body: readBody("issue_body_api_situations.txt"), labels: ["backend"] },
  { title: "[API] POST /api/slots の実装", body: readBody("issue_body_api_slots_post.txt"), labels: ["backend"] },
  { title: "[API] PUT /api/slots/:slotIndex の実装", body: readBody("issue_body_api_slots_put.txt"), labels: ["backend"] },
  { title: "[API] GET /api/matching の実装", body: readBody("issue_body_api_matching_get.txt"), labels: ["backend"] },
  { title: "[API] PATCH /api/users/me の実装", body: readBody("issue_body_api_users_me_patch.txt"), labels: ["backend"] },
  { title: "[AI] 1. Gemini API クライアントの初期化", body: readBody("issue_body_ai_gemini.txt"), labels: ["ai"] },
  { title: "[AI] 2. Big5・要約のプロンプトテンプレート", body: readBody("issue_body_ai_prompts.txt"), labels: ["ai"] },
  { title: "[AI] 3. 会話ログから selfVector を返す実装", body: readBody("issue_body_ai_analyze_self.txt"), labels: ["ai"] },
  { title: "[AI] 4. /api/ai/analyze ルートハンドラの実装", body: readBody("issue_body_ai_analyze_route.txt"), labels: ["ai"] },
  { title: "[AI] 5. POST /api/ai/chat の実装", body: readBody("issue_body_ai_daily.txt"), labels: ["ai"] },
  { title: "[AI] 6. 共鳴詳細用「二人の関係性を解説」プロンプト", body: readBody("issue_body_ai_explain_self.txt"), labels: ["ai"] },
  { title: "[AI] 7. POST /api/matching/explain ルートハンドラの実装", body: readBody("issue_body_ai_explain_route.txt"), labels: ["ai"] },
  { title: "[フロント] UI基盤・shadcn導入・共通レイアウト・認証ガード", body: readBody("issue_body_front_ui_base.txt"), labels: ["front"] },
  { title: "[フロント] ログイン/新規登録ページとログイン〜ホーム遷移", body: readBody("issue_body_front_login.txt"), labels: ["front"] },
  { title: "[フロント] ホーム（AIガチャ）ページ", body: readBody("issue_body_front_home.txt"), labels: ["front"] },
  { title: "[フロント] ホーム（AIガチャ）追加タスク（シチュエーションAPI・フロントBig5）", body: readBody("issue_body_front_home_extra.txt"), labels: ["front"] },
  { title: "[フロント] AI Mirror チャットページ", body: readBody("issue_body_front_chat.txt"), labels: ["front"] },
  { title: "[フロント] 分人レポートページ", body: readBody("issue_body_front_report.txt"), labels: ["front"] },
  { title: "[フロント] プロフィール管理ページ", body: readBody("issue_body_front_profile.txt"), labels: ["front"] },
  { title: "[フロント] 共鳴マッチングページ", body: readBody("issue_body_front_matching.txt"), labels: ["front"] },
  { title: "[フロント] 共鳴詳細ページ", body: readBody("issue_body_front_matching_detail.txt"), labels: ["front"] },
  { title: "[フロント] Big5レーダーチャートコンポーネント", body: readBody("issue_body_front_chart.txt"), labels: ["front"] },
  { title: "[フロント] ホーム〜レポート〜保存・プロフィール・マッチングのフロー", body: readBody("issue_body_front_flow.txt"), labels: ["front"] },
];

async function ensureLabel(name, color) {
  try {
    await api("POST", "/labels", { name, color });
    console.log(`Created label: ${name}`);
  } catch (e) {
    if (e.message.includes("already_exists") || e.message.includes("422")) return;
    throw e;
  }
}

async function main() {
  await ensureLabel("front", "1d76db");
  await ensureLabel("backend", "fbca04");
  const existing = await getExistingIssueTitles();
  try {
    await updateIssueTitle(1, "[DB] 1. Supabase プロジェクト作成と接続情報の管理");
  } catch (e) {
    if (!e.message.includes("404")) throw e;
  }
  for (const issue of issues) {
    if (existing.has(issue.title)) {
      console.log(`Skip (already exists): ${issue.title}`);
      continue;
    }
    await createIssue(issue.title, issue.body, issue.labels);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

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
    return readFileSync(p, "utf-8");
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
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);
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

const issues = [
  { title: "[DB] profiles テーブル作成と Auth Trigger", body: readBody("issue_body_db_profiles.txt"), labels: ["db"] },
  { title: "[DB] slots テーブル作成", body: readBody("issue_body_db_slots.txt"), labels: ["db"] },
  { title: "[DB] RLS ポリシー設定", body: readBody("issue_body_db_rls.txt"), labels: ["db"] },
  { title: "[DB] pgvector 拡張とベクトルインデックス", body: readBody("issue_body_db_pgvector.txt"), labels: ["db"] },
  { title: "[DB] 共鳴スコア計算 RPC", body: readBody("issue_body_db_rpc.txt"), labels: ["db"] },
  { title: "[API] GET /api/users/me の実装", body: readBody("issue_body_api_users_me_get.txt"), labels: ["backend"] },
  { title: "[API] POST /api/slots の実装", body: readBody("issue_body_api_slots_post.txt"), labels: ["backend"] },
  { title: "[API] PUT /api/slots/:slotIndex の実装", body: readBody("issue_body_api_slots_put.txt"), labels: ["backend"] },
  { title: "[API] DELETE /api/slots/:slotIndex の実装", body: readBody("issue_body_api_slots_delete.txt"), labels: ["backend"] },
  { title: "[API] GET /api/matching の実装", body: readBody("issue_body_api_matching_get.txt"), labels: ["backend"] },
  { title: "[API] PATCH /api/users/me の実装", body: readBody("issue_body_api_users_me_patch.txt"), labels: ["backend"] },
  { title: "[API] POST /api/matching/explain の実装", body: readBody("issue_body_api_matching_explain.txt"), labels: ["backend"] },
  { title: "[AI] Gemini API クライアントの初期化", body: readBody("issue_body_ai_gemini.txt"), labels: ["ai"] },
  { title: "[AI] 会話ログから selfVector を返す実装", body: readBody("issue_body_ai_analyze_self.txt"), labels: ["ai"] },
  { title: "[AI] resonanceVector を返すロジックの実装", body: readBody("issue_body_ai_analyze_resonance.txt"), labels: ["ai"] },
  { title: "[AI] personaSummary 要約ロジックの実装", body: readBody("issue_body_ai_analyze_summary.txt"), labels: ["ai"] },
  { title: "[AI] /api/ai/analyze ルートハンドラの実装", body: readBody("issue_body_ai_analyze_route.txt"), labels: ["ai"] },
  { title: "[AI] 日替わり3体の性格パターンと今日の3体ロジック", body: readBody("issue_body_ai_daily.txt"), labels: ["ai"] },
  { title: "[AI] Big5・resonance・要約のプロンプトテンプレート", body: readBody("issue_body_ai_prompts.txt"), labels: ["ai"] },
  { title: "[AI] 共鳴詳細用「二人の関係性を解説」プロンプト", body: readBody("issue_body_ai_explain.txt"), labels: ["ai"] },
  { title: "[フロント] UI基盤・shadcn導入・共通レイアウト・認証ガード", body: readBody("issue_body_front_ui_base.txt"), labels: ["front"] },
  { title: "[フロント] ログイン/新規登録ページとログイン〜ホーム遷移", body: readBody("issue_body_front_login.txt"), labels: ["front"] },
  { title: "[フロント] ホーム（AIガチャ）ページ", body: readBody("issue_body_front_home.txt"), labels: ["front"] },
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
  await updateIssueTitle(1, "[DB] Supabase プロジェクト作成と接続情報の管理");
  for (const issue of issues) {
    await createIssue(issue.title, issue.body, issue.labels);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

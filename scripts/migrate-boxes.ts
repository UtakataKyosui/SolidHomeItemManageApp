import { Database } from "bun:sqlite";

const sqlite = new Database("./drizzle/db.sqlite");

// 既存の全Storageを取得
const storages = sqlite.query("SELECT * FROM storages").all() as Array<{
  id: number;
  name: string;
  user_id: number;
}>;

console.log(`Found ${storages.length} storages to migrate`);

for (const storage of storages) {
  // このStorageに既にデフォルトBoxがあるかチェック
  const existing = sqlite
    .query("SELECT * FROM boxes WHERE storage_id = ? AND is_default = 1")
    .get(storage.id);

  if (existing) {
    console.log(`Storage "${storage.name}" (id=${storage.id}) already has a default box, skipping`);
    continue;
  }

  // デフォルトBoxを作成
  const result = sqlite
    .query("INSERT INTO boxes (name, user_id, storage_id, is_default) VALUES (?, ?, ?, 1)")
    .run("デフォルト", storage.user_id, storage.id);
  const boxId = result.lastInsertRowid;
  console.log(`Created default box (id=${boxId}) for storage "${storage.name}" (id=${storage.id})`);

  // このStorageに紐づくStorageRelationsをBoxRelationsに変換
  const relations = sqlite
    .query("SELECT * FROM storage_relations WHERE storage_id = ?")
    .all(storage.id) as Array<{ id: number; item_id: number; storage_id: number }>;

  for (const rel of relations) {
    // 既に同じBoxRelationsがあるかチェック
    const existingBoxRel = sqlite
      .query("SELECT * FROM box_relations WHERE item_id = ? AND box_id = ?")
      .get(rel.item_id, boxId);

    if (!existingBoxRel) {
      sqlite
        .query("INSERT INTO box_relations (item_id, box_id) VALUES (?, ?)")
        .run(rel.item_id, boxId);
      console.log(`  Migrated item (id=${rel.item_id}) to default box`);
    }
  }
}

console.log("Migration complete!");

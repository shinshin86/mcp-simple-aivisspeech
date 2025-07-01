# MCP Simple AivisSpeech

[English](README.md) | [日本語](README.ja.md)

> 🙏 **特別な感謝**  
> このプロジェクトは [@t09tanaka](https://github.com/t09tanaka) による [mcp-simple-voicevox](https://github.com/t09tanaka/mcp-simple-voicevox) をベースにしています。  
> VOICEVOX用の優れたMCPサーバーを作成された功績に深く感謝いたします。このAivisSpeech版の基礎となりました。

AivisSpeech音声合成エンジンとシームレスに統合するためのModel Context Protocol (MCP) サーバーです。このプロジェクトにより、AIアシスタントやアプリケーションが、カスタマイズ可能な音声パラメータで自然な日本語音声にテキストを変換できます。

## ✨ 機能

- 🎙️ **音声合成**: AivisSpeechを使用した高品質な日本語音声合成
- 👥 **複数の音声キャラクター**: 様々な話者と音声スタイルをサポート（デフォルト: Anneli ノーマル）
- ⚙️ **設定可能なパラメータ**: 速度、ピッチ、音量、イントネーションの調整
- 🔊 **クロスプラットフォーム音声再生**: macOS、Windows、Linuxでの自動音声再生
- 🔔 **タスク通知**: プロセス完了時の音声通知
- 🚀 **簡単な統合**: AIアシスタント統合のためのシンプルなMCPプロトコル
- 📊 **エンジンステータス監視**: AivisSpeechエンジンのリアルタイムステータスチェック
- 🛡️ **スマートなエラーハンドリング**: 話者の提案を含む役立つエラーメッセージ

## 📋 前提条件

- **Node.js**: バージョン18.0.0以上
- **AivisSpeechエンジン**: `http://127.0.0.1:10101` (デフォルトポート) で実行中
- **オーディオシステム**: 再生のためのシステムオーディオ機能

## MCP Simple AivisSpeechの設定方法

### Claude Codeを使用した設定

Claude Codeで使用する場合、先にMCPサーバーを起動しておいてから利用する必要があります。

> ✨ **npxを使用すると、常に最新バージョンが自動的に取得されます - 手動更新は不要！**

1. AivisSpeech MCP サーバーをClaude Codeを利用するターミナルとは別のターミナル上で手動で起動しておく

```bash
npx @shinshin86/mcp-simple-aivisspeech@latest
```

2. Claude Code に MCP サーバーを登録

```bash
claude mcp add aivisspeech -e AIVISSPEECH_URL=http://127.0.0.1:10101 -- npx @shinshin86/mcp-simple-aivisspeech@latest
```

デフォルトでは、サーバーはローカルスコープ（現在のプロジェクトのみ）に追加されます。全プロジェクトで利用可能にしたい場合は、`-s user`オプションを使用してください：

```bash
claude mcp add aivisspeech -s user -e AIVISSPEECH_URL=http://127.0.0.1:10101 -- npx @shinshin86/mcp-simple-aivisspeech@latest
```

また音声による通知を毎回指定するのが面倒な場合は `CLAUDE.md` に以下のような記載を追加するとよいでしょう。  
（英語での `CLAUDE.md` の記載は [英語版](README.md) に記載しています）

```md
## タスク完了時の動作
- 全てのタスクを完了したら、必ずaivisspeech mcpツールを使って「タスクが完了しました」と音声で通知してください
- ユーザーの判断や確認が必要な場合も、aivisspeech mcpツールを使って「判断をお待ちしています」と音声で通知してください

### 通知のタイミング
- こちらに質問を実施したタイミング
- タスクが全て完了したタイミング
- エラーや問題が発生した時
```

3. ツールが認識されたか確認

```bash
claude mcp list

# またはClaude Codeを立ち上げて
/mcp
```

`aivisspeech` が表示されていれば成功です。

> 💡 ポイント: Claude Codeは安全のためコマンドを自動実行しません。サーバーを起動し忘れるとツールが表示されないので、開発中はターミナルで上記 `npx` コマンドを常駐させるか、`pm2` や `systemd --user` などで常駐化することを推奨します。

### Claude Desktopを使用した設定

Claude Desktopに手動でMCPサーバーを追加する場合は以下の設定を追加するだけで可能です：

> ✨ **npxを使用すると、常に最新バージョンが自動的に取得されます - 手動更新は不要！**

```json
{
  "mcpServers": {
    "aivisspeech": {
      "command": "npx",
      "args": ["@shinshin86/mcp-simple-aivisspeech@latest"],
      "env": {
        "AIVISSPEECH_URL": "http://127.0.0.1:10101"
      }
    }
  }
}
```

## ⚙️ AivisSpeechエンジンのセットアップ

このMCPサーバーを使用する前に、AivisSpeechをローカルで実行しておく必要があります：

1. [https://aivis-project.com/](https://aivis-project.com/) からAivisSpeechをダウンロード
2. ローカルマシンでAivisSpeechを起動
3. エンジンはデフォルトポート10101で起動します
4. `http://127.0.0.1:10101/docs` にアクセスしてエンジンが実行中であることを確認

## 📖 その他の使用方法

### ローカル開発の場合

```bash
# MCPサーバーを実行
npm start

# ホットリロードで開発
npm run dev

# すべてが動作しているか確認
npm test
```

リポジトリをクローン、依存関係のインストール、ビルドが必要な場合：

```bash
# リポジトリをクローン
git clone https://github.com/shinshin86/mcp-simple-aivisspeech.git
cd mcp-simple-aivisspeech

# 依存関係をインストール
npm install

# プロジェクトをビルド
npm run build
```

## 🛠️ 利用可能なツール

### 🎤 `speak`
カスタマイズ可能な音声パラメータでテキストを音声に変換し、音声を再生します。

**パラメータ:**
- `text` *(必須)*: 音声に変換するテキスト
- `speaker` *(オプション)*: 話者/音声ID（デフォルト: `888753760` - Anneli ノーマル）
- `speedScale` *(オプション)*: 音声速度倍率（`0.5`-`2.0`、デフォルト: `1.0`）
- `pitchScale` *(オプション)*: ピッチ調整（`-0.15`-`0.15`、デフォルト: `0.0`）
- `volumeScale` *(オプション)*: 音量レベル（`0.0`-`2.0`、デフォルト: `1.0`）
- `playAudio` *(オプション)*: 生成された音声を再生するかどうか（デフォルト: `true`）

**例:**
```json
{
  "text": "こんにちは、世界！",
  "speaker": 888753760,
  "speedScale": 1.2,
  "pitchScale": 0.05,
  "volumeScale": 1.5
}
```

### 👥 `get_speakers`
利用可能なすべての音声キャラクターとそのスタイルのリストを取得します。

**戻り値:** ID、名前、利用可能な音声スタイルを含む話者のリスト。

### 🔔 `notify_completion`
タスクが完了したときに音声通知を再生します。

**パラメータ:**
- `message` *(オプション)*: アナウンスする完了メッセージ（デフォルト: `"処理が完了しました"`）
- `speaker` *(オプション)*: 通知音声の話者ID（デフォルト: `888753760` - Anneli ノーマル）

**例:**
```json
{
  "message": "データ処理が完了しました",
  "speaker": 888753760
}
```

### 📊 `check_engine_status`
AivisSpeechエンジンの現在のステータスとバージョンを確認します。

**戻り値:** エンジンステータス、バージョン情報、接続詳細。

## 🖥️ プラットフォームサポート

### 音声再生システム

| プラットフォーム | 音声コマンド | 必要条件 |
|----------|---------------|----------|
| **macOS** | `afplay` | ビルトイン（追加設定不要） |
| **Windows** | PowerShell Media.SoundPlayer | Windows PowerShell |
| **Linux** | `aplay` | ALSA utils (`sudo apt install alsa-utils`) |

### テスト済み環境

- ✅ macOS 12+ (Intel & Apple Silicon)
- ✅ Windows 10/11
- ✅ Ubuntu 20.04+
- ✅ Node.js 18.x, 20.x, 21.x

## 🧪 開発

### 利用可能なスクリプト

```bash
# 開発とビルド
npm run dev          # ホットリロードで実行 (tsx)
npm run build        # TypeScriptをdist/にコンパイル
npm start           # コンパイル済みサーバーを実行

# コード品質
npm run lint        # ESLintを実行
npm run test        # Vitestテストを実行（単一実行）
npm run test:watch  # ウォッチモードでテストを実行
npm run test:ui     # UIでテストを実行
npm run test:coverage # カバレッジ付きでテストを実行

# ユーティリティ
npm run clean       # dist/ ディレクトリをクリーン
```

### プロジェクト構成

```
mcp-simple-aivisspeech/
├── src/
│   ├── index.ts                  # MCPサーバー & ツールハンドラー
│   └── aivisspeech-client.ts     # AivisSpeech APIクライアント
├── tests/
│   └── aivisspeech-client.test.ts # ユニットテスト
├── dist/                         # コンパイル出力
├── docs/                         # ドキュメント
└── config files                  # TS、ESLint、Vitest設定
```

### APIクライアントアーキテクチャ

`AivisSpeechClient`クラスが提供するもの：
- **HTTPクライアント**: AxiosベースのAPI通信
- **エラーハンドリング**: 包括的なエラーキャッチとレポート
- **型安全性**: すべてのAPIレスポンスに対する完全なTypeScriptインターフェース
- **接続管理**: ヘルスチェックとステータス監視

### 新機能の追加

1. **新しいツール**: `src/index.ts` の `CallToolRequestSchema` にハンドラーを追加
2. **APIメソッド**: `AivisSpeechClient` クラスを拡張
3. **型**: `aivisspeech-client.ts` のインターフェースを更新
4. **テスト**: 対応するテストケースを追加

## 🔧 トラブルシューティング

### よくある問題

#### AivisSpeechエンジンが見つからない
```
Error: Failed to get version: connect ECONNREFUSED 127.0.0.1:10101
```
**解決策:** AivisSpeechエンジンが正しいポートで実行されていることを確認してください。

#### 音声再生の失敗
```
Error: Audio player exited with code 1
```
**解決策:**
- **macOS**: `afplay` が利用可能か確認
- **Linux**: ALSA utilsをインストール: `sudo apt install alsa-utils`
- **Windows**: PowerShellの実行ポリシーがスクリプトを許可していることを確認

#### 権限拒否
```
Error: spawn afplay EACCES
```
**解決策:** ファイルの権限とシステムオーディオ設定を確認してください。

### デバッグモード

詳細なログを有効化：
```bash
DEBUG=mcp-aivisspeech npm run dev
```

## 📄 ライセンス

このプロジェクトはApache License 2.0の下でライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🤝 貢献

貢献を歓迎します！以下の手順に従ってください：

1. リポジトリを**フォーク**
2. フィーチャーブランチを**作成** (`git checkout -b feature/amazing-feature`)
3. 変更を**コミット** (`git commit -m 'Add amazing feature'`)
4. ブランチに**プッシュ** (`git push origin feature/amazing-feature`)
5. プルリクエストを**オープン**

### 開発ガイドライン

- 既存のTypeScript/ESLint設定に従う
- 新機能のテストを追加
- API変更のドキュメントを更新
- クロスプラットフォーム互換性を確保

## 🙏 謝辞

- 優れたTTSエンジンを提供する[AivisSpeechプロジェクト](https://aivis-project.github.io/AivisSpeech-Engine/)
- 統合フレームワークの[Model Context Protocol](https://github.com/anthropics/mcp)
- インスピレーションと参考にした[VOICEVOX MCP](https://github.com/t09tanaka/mcp-simple-voicevox)

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/shinshin86/mcp-simple-aivisspeech/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shinshin86/mcp-simple-aivisspeech/discussions)
- **Documentation**: [AivisSpeech API Docs](https://aivis-project.github.io/AivisSpeech-Engine/api/)

---

日本のTTSコミュニティのために ❤️ を込めて作られました
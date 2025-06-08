#!/bin/bash

# 開発サーバー管理スクリプト
# 使用方法: ./dev-server.sh [start|stop|restart|status]

PROJECT_DIR="/Users/namiwatanabe/Desktop/hanatsugu"
PORT=3000

# カラー定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ポートをチェック
check_port() {
    lsof -ti:$PORT 2>/dev/null
}

# プロセスを強制終了
kill_process() {
    local pid=$(check_port)
    if [ ! -z "$pid" ]; then
        log_warn "ポート $PORT で実行中のプロセス (PID: $pid) を終了します"
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

# Next.jsプロセスを終了
kill_nextjs() {
    local pids=$(pgrep -f "next dev" 2>/dev/null)
    if [ ! -z "$pids" ]; then
        log_warn "Next.js開発サーバーを終了します"
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# 開発サーバー開始
start_server() {
    cd "$PROJECT_DIR"
    
    # 既存プロセスをチェック・終了
    kill_nextjs
    kill_process
    
    # キャッシュクリア
    log_info "キャッシュをクリアしています..."
    rm -rf .next
    
    # 依存関係チェック
    if [ ! -d "node_modules" ]; then
        log_warn "node_modules が見つかりません。npm install を実行します..."
        npm install
    fi
    
    # 開発サーバー開始
    log_info "開発サーバーを開始しています..."
    npm run dev &
    
    # サーバー起動待機
    local count=0
    local max_attempts=30
    
    while [ $count -lt $max_attempts ]; do
        if check_port > /dev/null; then
            log_info "開発サーバーが正常に起動しました"
            log_info "アクセス: http://localhost:$PORT"
            return 0
        fi
        sleep 1
        count=$((count + 1))
        echo -n "."
    done
    
    log_error "サーバーの起動に失敗しました"
    return 1
}

# 開発サーバー停止
stop_server() {
    log_info "開発サーバーを停止しています..."
    kill_nextjs
    kill_process
    log_info "開発サーバーを停止しました"
}

# ステータス確認
check_status() {
    local pid=$(check_port)
    if [ ! -z "$pid" ]; then
        log_info "開発サーバーは実行中です (PID: $pid)"
        log_info "アクセス: http://localhost:$PORT"
        return 0
    else
        log_warn "開発サーバーは停止しています"
        return 1
    fi
}

# 再起動
restart_server() {
    log_info "開発サーバーを再起動しています..."
    stop_server
    sleep 3
    start_server
}

# メイン処理
case "${1:-start}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        check_status
        ;;
    *)
        echo "使用方法: $0 [start|stop|restart|status]"
        echo "  start   - 開発サーバーを開始"
        echo "  stop    - 開発サーバーを停止"  
        echo "  restart - 開発サーバーを再起動"
        echo "  status  - サーバーの状態を確認"
        exit 1
        ;;
esac
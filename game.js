class PuzzleGame {
    constructor() {
        this.size = 3; // 3x3 拼图
        this.tiles = [];
        this.moves = 0;
        this.gameContainer = document.getElementById('puzzle-container');
        this.movesDisplay = document.getElementById('moves');
        this.timerDisplay = document.getElementById('timer');
        this.startTime = null;
        this.timerInterval = null;
        this.init();
    }

    init() {
        // 创建拼图容器
        this.gameContainer.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        
        // 初始化拼图
        this.createTiles();
        this.shuffleTiles();
        this.updateDisplay();
        this.startTimer();
    }

    createTiles() {
        this.tiles = [];
        for (let i = 0; i < this.size * this.size - 1; i++) {
            this.tiles.push(i + 1);
        }
        this.tiles.push(null); // 空白格
    }

    shuffleTiles() {
        for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
        }
        // 确保拼图可解
        if (!this.isSolvable()) {
            this.shuffleTiles();
        }
    }

    isSolvable() {
        let inversions = 0;
        const tiles = this.tiles.filter(tile => tile !== null);
        
        for (let i = 0; i < tiles.length - 1; i++) {
            for (let j = i + 1; j < tiles.length; j++) {
                if (tiles[i] > tiles[j]) {
                    inversions++;
                }
            }
        }
        
        return inversions % 2 === 0;
    }

    updateDisplay() {
        this.gameContainer.innerHTML = '';
        this.tiles.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = `tile ${tile === null ? 'empty' : ''}`;
            tileElement.textContent = tile;
            tileElement.onclick = () => this.moveTile(index);
            this.gameContainer.appendChild(tileElement);
        });
    }

    moveTile(index) {
        const emptyIndex = this.tiles.indexOf(null);
        if (this.isValidMove(index, emptyIndex)) {
            [this.tiles[index], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[index]];
            this.moves++;
            this.updateDisplay();
            this.movesDisplay.textContent = `Moves: ${this.moves}`;
            
            if (this.isComplete()) {
                this.gameComplete();
            }
        }
    }

    isValidMove(index, emptyIndex) {
        const row = Math.floor(index / this.size);
        const col = index % this.size;
        const emptyRow = Math.floor(emptyIndex / this.size);
        const emptyCol = emptyIndex % this.size;
        
        return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
               (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    }

    isComplete() {
        return this.tiles.every((tile, index) => {
            if (index === this.tiles.length - 1) {
                return tile === null;
            }
            return tile === index + 1;
        });
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerDisplay.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    gameComplete() {
        clearInterval(this.timerInterval);
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        // 创建分享对话框
        const shareDialog = document.createElement('div');
        shareDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        shareDialog.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 flex flex-col items-center">
                <h3 class="text-2xl font-bold text-apple-blue mb-2">恭喜你成功啦！</h3>
                <img src='images/puzzle-success.jpg' alt='成功拼图样例' class='w-40 h-40 object-cover rounded mb-4 border-4 border-apple-blue'>
                <p class="text-gray-600 mb-2">移动次数: ${this.moves}</p>
                <p class="text-gray-600 mb-4">用时: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
                <div class="flex flex-col space-y-4 w-full">
                    <button onclick="window.location.reload()" class="bg-apple-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition w-full">
                        再玩一次
                    </button>
                    <button onclick="shareToX()" class="bg-black text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition flex items-center justify-center w-full">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        分享到 X
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(shareDialog);
    }

    reset() {
        this.moves = 0;
        this.movesDisplay.textContent = 'Moves: 0';
        this.createTiles();
        this.shuffleTiles();
        this.updateDisplay();
        clearInterval(this.timerInterval);
        this.startTimer();
    }
}

// 添加分享到X的函数
function shareToX() {
    const gameUrl = window.location.href;
    const gameTitle = "Mindful Puzzle - 数字拼图游戏";
    const gameDescription = "刚刚完成了 Mindful Puzzle 数字拼图挑战！来试试看你能用多少步完成？";
    const hashtags = "puzzlegame,braingame,numberpuzzle";
    
    // 创建分享URL
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(gameDescription)}&url=${encodeURIComponent(gameUrl)}&hashtags=${hashtags}`;
    
    // 打开分享窗口
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
}); 
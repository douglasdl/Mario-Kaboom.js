kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    canvas: document.querySelector("#mycanvas"),
    background: [ 0, 0, 0, 1],
})

loadRoot('assets/')
loadSprite('coin', 'coin.png')
loadSprite('evil-shroom', 'evil-shroom.png')
loadSprite('brick', 'brick.png')
loadSprite('block', 'block.png')
loadSprite('mario', 'mario.png')
loadSprite('mushroom', 'mushroom.png')
loadSprite('surprise', 'surprise.png')
loadSprite('unboxed', 'unboxed.png')
loadSprite('pipe-top-left', 'pipe-top-left.png')
loadSprite('pipe-top-right', 'pipe-top-right.png')
loadSprite('pipe-bottom-left', 'pipe-bottom-left.png')
loadSprite('pipe-bottom-right', 'pipe-bottom-right.png')

const MOVE_SPEED = 120
const JUMP_FORCE = 500
const BIG_JUMP_FORCE = 700
let current_jump_force = JUMP_FORCE 

const LEVELS = [
    [
        '                                                         ',
        '                                                         ',
        '                $                                        ',
        '                                                         ',
        '       $                                                 ',
        '     $   $    =%=*=                                      ',
        '                                                         ',
        '                             ()  ()                      ',
        '                      ^   ^  []  []                      ',
        '===============================  =======  ===============',
        '===============================  =======  ===============',
    ],
    [
        '                                ',
        '                                ',
        '                                ',
        '                                ',
        '                                ',
        '                                ',
        '                                ',
        '                                ',
        '                                ',
        '========  ====  =========  =====',
        '========  ====  =========  =====',
    ],
]


scene("game", ({ levelIdx, playerName, score, coins, worldNumber, levelNumber, remainingTime }) => {
    
    //gravity(2400)
    
    layers(['bg', 'obj', 'ui'], 'obj')

    const gameLevel = addLevel(LEVELS[levelIdx || 0], {
        width: 20,
        height: 20,
        pos: vec2(10, 250),
        "=": () => [sprite("block"), area(), solid(), origin("bot")],
        "$": () => [sprite("coin"), "coin", origin("bot")],
        "%": () => [sprite("surprise"), area(), solid(), scale(0.5), 'coin-surprise', origin("bot")],
        "*": () => [sprite("surprise"), area(), solid(), scale(0.5), 'mushroom-surprise' ,origin("bot")],
        ".": () => [sprite("unboxed"), area(), solid(), origin("bot")],
        "[": () => [sprite("pipe-top-left"), area(), solid(), scale(0.5), origin("bot")],
        "]": () => [sprite("pipe-top-right"), area(), solid(), scale(0.5), origin("bot")],
        "(": () => [sprite("pipe-bottom-left"), area(), solid(), scale(0.5), origin("bot")],
        ")": () => [sprite("pipe-bottom-right"), area(), solid(), scale(0.5), origin("bot")],
        "^": () => [sprite("evil-shroom"), area(), solid(), origin("bot"), "evil-shroom"],
        "#": () => [sprite("mushroom"), area(), solid(), "mushroom", origin("bot"), body()],
    })

    // UI Texts
    const playerNameLabel = add([text(playerName), pos(30, 6), scale(0.3), color(255, 0, 0), layer('ui')])
    const scoreLabel = add([text("00000" + score), pos(30, 26), scale(0.3), layer('ui'), { value: score }])
    const coinsLabel = add([text("$: " + coins), pos(140, 26), scale(0.3), layer('ui'), { value: coins }])
    const levelLabel = add([text("WORLD: " + worldNumber + "-" + levelNumber), pos(300, 6), scale(0.3), layer('ui'), { value: levelNumber }])
    const timerLabel = add([text('Time: ' + remainingTime), pos(670, 6), scale(0.3), layer('ui'), { value: remainingTime }])


    function big() {
        let timer = 0
        let isBig = false
        return {
            update() {
                if(isBig) {
                    timer -= dt()
                    if(timer <= 0) {
                        this.smallify()
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1)
                current_jump_force = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(2)
                current_jump_force = BIG_JUMP_FORCE
                timer = time
                isBig = true
            }
        }
    }

    // Player
    const player = add([
        sprite("mario"), area(), solid(), 
        pos(30, 100),
        body(),
        big(),
        origin("bot"),
    ])

    // Headbutt
    player.onHeadbutt((obj) => {
        if(obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('.', obj.gridPos.sub(0, 0))
        }
        if(obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('.', obj.gridPos.sub(0, 0))
        }
    })

    // Get Mushroom
    player.collides("mushroom", (m) => {
        destroy(m)
        player.biggify(6)
    })

    // Get Coin
    player.collides("coin", (c) => {
        destroy(c)
        coins++
        score += 10
        coinsLabel.value = coins
        scoreLabel.value = score

    })

    // Control
    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    })

    keyPress('space', () => {
        if(player.grounded()) {
            player.jump(current_jump_force)
        }
    })

    // Mushroom
    action('mushroom', (m) => {
        m.move(40, 0)
    })
		
})

function start() {
	// Start with the "game" scene, with initial parameters
	go("game", {
		levelIdx: 0,
        playerName: 'Mario',
		score: 000000,
        coins: 0,
        worldNumber: 1,
        levelNumber: 1,
        remainingTime: 299,
	})
}

start()

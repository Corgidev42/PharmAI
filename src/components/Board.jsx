import { useMemo } from 'react'
import { useGameStore } from '../store/useGameStore'
import { TOTAL_TILES, BOARD_COLS, BOARD_ROWS, getTilePosition } from '../game/constants'
import Tile from './Tile'
import Pawn from './Pawn'

export default function Board() {
  const tiles = useGameStore((s) => s.tiles)
  const players = useGameStore((s) => s.players)

  const tilePositions = useMemo(
    () => Array.from({ length: TOTAL_TILES }, (_, i) => getTilePosition(i)),
    []
  )

  // Build grid: only perimeter cells are active
  const grid = useMemo(() => {
    const map = new Map()
    for (let i = 0; i < TOTAL_TILES; i++) {
      const { row, col } = tilePositions[i]
      map.set(`${row}-${col}`, i)
    }
    return map
  }, [tilePositions])

  return (
    <div className="relative">
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${BOARD_COLS}, 4rem)`,
          gridTemplateRows: `repeat(${BOARD_ROWS}, 4rem)`,
        }}
      >
        {Array.from({ length: BOARD_ROWS * BOARD_COLS }, (_, idx) => {
          const row = Math.floor(idx / BOARD_COLS)
          const col = idx % BOARD_COLS
          const tileIndex = grid.get(`${row}-${col}`)

          if (tileIndex == null) {
            return <div key={idx} className="w-16 h-16" />
          }

          return (
            <Tile
              key={tileIndex}
              tile={tiles[tileIndex]}
              index={tileIndex}
              hasPlayer0={players[0].position === tileIndex}
              hasPlayer1={players[1].position === tileIndex}
            />
          )
        })}
      </div>

      {players.map((player) => {
        const pos = tilePositions[player.position]
        return (
          <Pawn
            key={player.id}
            playerId={player.id}
            row={pos.row}
            col={pos.col}
            color={player.color}
          />
        )
      })}
    </div>
  )
}

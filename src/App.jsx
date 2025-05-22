import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, RotateCcw, Lightbulb, Shuffle } from 'lucide-react';

// Simple keyboard component (simplified version of react-simple-keyboard)
const SimpleKeyboard = ({ onKeyPress, layout = "default", disabled = false }) => {
  const qwertyLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  return (
    <div className="w-full max-w-lg mx-auto">
      {qwertyLayout.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 mb-1">
          {row.map((key) => (
            <button
              key={key}
              className={`
                ${key === 'ENTER' || key === 'BACKSPACE' ? 'px-3' : 'w-8 h-12'} 
                bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={() => !disabled && onKeyPress(key)}
              disabled={disabled}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

// Wordle Game Component
const WordleGame = () => {
  const SOLUTION = "AUGIE"; // You can change this
  const MAX_GUESSES = 6;
  
  const [guesses, setGuesses] = useState(Array(MAX_GUESSES).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const handleKeyPress = (key) => {
    if (gameOver) return;

    if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        const newGuesses = [...guesses];
        newGuesses[currentRow] = currentGuess;
        setGuesses(newGuesses);
        
        if (currentGuess.toUpperCase() === SOLUTION) {
          setWon(true);
          setGameOver(true);
        } else if (currentRow === MAX_GUESSES - 1) {
          setGameOver(true);
        } else {
          setCurrentRow(prev => prev + 1);
        }
        setCurrentGuess('');
      }
    } else if (currentGuess.length < 5 && key.match(/[A-Z]/)) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const getLetterStatus = (letter, position, word) => {
    if (!word) return '';
    const upperWord = word.toUpperCase();
    const upperLetter = letter.toUpperCase();
    
    if (SOLUTION[position] === upperLetter) return 'correct';
    if (SOLUTION.includes(upperLetter)) return 'present';
    return 'absent';
  };

  const reset = () => {
    setGuesses(Array(MAX_GUESSES).fill(''));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wordle</h1>
        <button onClick={reset} className="p-2 hover:bg-gray-100 rounded">
          <RotateCcw size={20} />
        </button>
      </div>
      
      <div className="grid grid-rows-6 gap-1 mb-6 max-w-xs mx-auto">
        {Array(MAX_GUESSES).fill().map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-1">
            {Array(5).fill().map((_, colIndex) => {
              const isCurrentRow = rowIndex === currentRow;
              const letter = isCurrentRow ? 
                (currentGuess[colIndex] || '') : 
                (guesses[rowIndex][colIndex] || '');
              const status = rowIndex < currentRow ? 
                getLetterStatus(letter, colIndex, guesses[rowIndex]) : '';
              
              return (
                <div
                  key={colIndex}
                  className={`
                    w-12 h-12 border-2 flex items-center justify-center text-lg font-bold
                    ${status === 'correct' ? 'bg-green-500 text-white border-green-500' :
                      status === 'present' ? 'bg-yellow-500 text-white border-yellow-500' :
                      status === 'absent' ? 'bg-gray-500 text-white border-gray-500' :
                      letter ? 'border-gray-400' : 'border-gray-300'}
                  `}
                >
                  {letter.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="text-center mb-4">
          <p className="text-lg font-semibold">
            {won ? 'Congratulations!' : `Game Over! The word was ${SOLUTION}`}
          </p>
        </div>
      )}

      <SimpleKeyboard onKeyPress={handleKeyPress} disabled={gameOver} />
    </div>
  );
};

// Connections Game Component
const ConnectionsGame = () => {
  // You can customize these groups
  const GROUPS = [
    { words: ['DOG', 'CAT', 'BIRD', 'FISH'], category: 'PETS', color: 'yellow' },
    { words: ['RED', 'BLUE', 'GREEN', 'PURPLE'], category: 'COLORS', color: 'green' },
    { words: ['APPLE', 'GOOGLE', 'MICROSOFT', 'AMAZON'], category: 'TECH COMPANIES', color: 'blue' },
    { words: ['SPRING', 'SUMMER', 'FALL', 'WINTER'], category: 'SEASONS', color: 'purple' }
  ];

  const allWords = GROUPS.flatMap(group => group.words).sort(() => Math.random() - 0.5);
  
  const [words, setWords] = useState(allWords);
  const [selected, setSelected] = useState([]);
  const [solvedGroups, setSolvedGroups] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const toggleWord = (word) => {
    if (selected.includes(word)) {
      setSelected(prev => prev.filter(w => w !== word));
    } else if (selected.length < 4) {
      setSelected(prev => [...prev, word]);
    }
  };

  const submitGuess = () => {
    if (selected.length !== 4) return;

    const group = GROUPS.find(g => 
      selected.every(word => g.words.includes(word)) && 
      g.words.every(word => selected.includes(word))
    );

    if (group) {
      setSolvedGroups(prev => [...prev, group]);
      setWords(prev => prev.filter(word => !group.words.includes(word)));
      setSelected([]);
      
      if (solvedGroups.length === 3) {
        setGameOver(true);
      }
    } else {
      setMistakes(prev => prev + 1);
      setSelected([]);
      if (mistakes >= 3) {
        setGameOver(true);
      }
    }
  };

  const shuffle = () => {
    setWords(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const reset = () => {
    setWords(allWords.sort(() => Math.random() - 0.5));
    setSelected([]);
    setSolvedGroups([]);
    setMistakes(0);
    setGameOver(false);
  };

  const getColorClass = (color) => {
    const colors = {
      yellow: 'bg-yellow-400',
      green: 'bg-green-400',
      blue: 'bg-blue-400',
      purple: 'bg-purple-400'
    };
    return colors[color] || 'bg-gray-400';
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Connections</h1>
        <button onClick={reset} className="p-2 hover:bg-gray-100 rounded">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="mb-4">
        <p>Mistakes remaining: {4 - mistakes}</p>
      </div>

      <div className="space-y-2 mb-6">
        {solvedGroups.map((group, index) => (
          <div key={index} className={`${getColorClass(group.color)} p-3 rounded text-center`}>
            <div className="font-bold text-sm">{group.category}</div>
            <div className="text-sm">{group.words.join(', ')}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {words.map((word, index) => (
          <button
            key={index}
            onClick={() => toggleWord(word)}
            className={`
              p-3 rounded text-sm font-semibold border-2 h-16
              ${selected.includes(word) 
                ? 'bg-gray-300 border-gray-400' 
                : 'bg-gray-100 border-gray-200 hover:bg-gray-200'}
            `}
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={shuffle}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-2"
        >
          <Shuffle size={16} />
          Shuffle
        </button>
        <button
          onClick={submitGuess}
          disabled={selected.length !== 4}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Submit
        </button>
      </div>

      {gameOver && (
        <div className="text-center mt-4">
          <p className="text-lg font-semibold">
            {solvedGroups.length === 4 ? 'Congratulations!' : 'Game Over!'}
          </p>
        </div>
      )}
    </div>
  );
};

// Strands Game Component
const StrandsGame = () => {
  const GRID = [
    ['T', 'H', 'E', 'M', 'E'],
    ['R', 'E', 'A', 'C', 'T'],
    ['S', 'T', 'A', 'T', 'E'],
    ['H', 'O', 'O', 'K', 'S'],
    ['P', 'R', 'O', 'P', 'S']
  ];

  // Define words to find (you can customize these)
  const WORDS_TO_FIND = ['REACT', 'STATE', 'PROPS', 'HOOKS', 'THEME'];
  const SPANGRAM = 'THEME'; // The word that spans the entire theme

  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);

  const getCellId = (row, col) => `${row}-${col}`;
  const parseCellId = (cellId) => cellId.split('-').map(Number);

  const isAdjacent = (cell1, cell2) => {
    const [row1, col1] = parseCellId(cell1);
    const [row2, col2] = parseCellId(cell2);
    return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1;
  };

  const handleCellClick = (row, col) => {
    const cellId = getCellId(row, col);
    
    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedCells([cellId]);
      setCurrentWord(GRID[row][col]);
    } else {
      if (selectedCells.includes(cellId)) {
        // Clicking on already selected cell - end selection
        checkWord();
      } else if (selectedCells.length === 0 || isAdjacent(selectedCells[selectedCells.length - 1], cellId)) {
        setSelectedCells(prev => [...prev, cellId]);
        setCurrentWord(prev => prev + GRID[row][col]);
      }
    }
  };

  const checkWord = () => {
    if (WORDS_TO_FIND.includes(currentWord) && !foundWords.includes(currentWord)) {
      setFoundWords(prev => [...prev, currentWord]);
    }
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedCells([]);
    setCurrentWord('');
    setIsSelecting(false);
  };

  const reset = () => {
    setSelectedCells([]);
    setFoundWords([]);
    setCurrentWord('');
    setIsSelecting(false);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Strands</h1>
        <button onClick={reset} className="p-2 hover:bg-gray-100 rounded">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm">Find words related to: <strong>React Development</strong></p>
        <p className="text-sm">Current word: <strong>{currentWord}</strong></p>
        <p className="text-sm">Found: {foundWords.length}/{WORDS_TO_FIND.length}</p>
      </div>

      <div className="grid grid-cols-5 gap-1 mb-6 max-w-xs mx-auto">
        {GRID.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const cellId = getCellId(rowIndex, colIndex);
            const isSelected = selectedCells.includes(cellId);
            const isFound = foundWords.some(word => {
              // Simple check if this cell is part of any found word
              return true; // You could implement more sophisticated highlighting here
            });

            return (
              <button
                key={cellId}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  w-12 h-12 rounded-full text-lg font-bold border-2
                  ${isSelected 
                    ? 'bg-blue-500 text-white border-blue-600' 
                    : foundWords.some(word => word.includes(letter))
                    ? 'bg-yellow-200 border-yellow-400'
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}
                `}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>

      <div className="space-y-2 mb-4">
        <h3 className="font-semibold">Found Words:</h3>
        {foundWords.map((word, index) => (
          <div key={index} className={`p-2 rounded ${word === SPANGRAM ? 'bg-purple-200' : 'bg-green-200'}`}>
            {word} {word === SPANGRAM && '(Spangram!)'}
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={resetSelection}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Clear Selection
        </button>
        <button
          onClick={checkWord}
          disabled={!currentWord}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Submit Word
        </button>
      </div>

      {foundWords.length === WORDS_TO_FIND.length && (
        <div className="text-center mt-4">
          <p className="text-lg font-semibold">Congratulations! All words found!</p>
        </div>
      )}
    </div>
  );
};

// Simple Crossword Component
const CrosswordGame = () => {
  // Simple 5x5 crossword grid (you can customize this)
  const GRID_SIZE = 5;
  const SOLUTION = [
    ['R', 'E', 'A', 'C', 'T'],
    ['O', '', 'P', '', 'H'],
    ['U', '', 'P', '', 'E'],
    ['T', '', 'S', '', 'M'],
    ['E', 'R', 'R', 'O', 'R']
  ];

  const CLUES = {
    across: {
      1: "JavaScript library for building UIs",
      5: "Mistake in code"
    },
    down: {
      1: "Path or direction",
      2: "React application state",
      3: "Single idea or subject",
      4: "CSS styling system"
    }
  };

  const [grid, setGrid] = useState(
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(''))
  );
  const [selectedCell, setSelectedCell] = useState(null);

  const handleCellChange = (row, col, value) => {
    if (SOLUTION[row][col] === '') return; // Don't allow input in black squares
    
    const newGrid = [...grid];
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);
  };

  const reset = () => {
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('')));
    setSelectedCell(null);
  };

  const checkSolution = () => {
    const isCorrect = grid.every((row, rowIndex) =>
      row.every((cell, colIndex) =>
        SOLUTION[rowIndex][colIndex] === '' || cell === SOLUTION[rowIndex][colIndex]
      )
    );
    
    if (isCorrect) {
      alert('Congratulations! Puzzle solved!');
    } else {
      alert('Not quite right. Keep trying!');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crossword</h1>
        <button onClick={reset} className="p-2 hover:bg-gray-100 rounded">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1 mb-6 max-w-xs mx-auto">
        {Array(GRID_SIZE).fill().map((_, rowIndex) =>
          Array(GRID_SIZE).fill().map((_, colIndex) => {
            const isBlack = SOLUTION[rowIndex][colIndex] === '';
            const cellId = `${rowIndex}-${colIndex}`;
            
            return (
              <div key={cellId} className="relative">
                {isBlack ? (
                  <div className="w-12 h-12 bg-black"></div>
                ) : (
                  <input
                    type="text"
                    maxLength="1"
                    value={grid[rowIndex][colIndex]}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    onClick={() => setSelectedCell(cellId)}
                    className={`
                      w-12 h-12 border-2 text-center text-lg font-bold
                      ${selectedCell === cellId ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    `}
                  />
                )}
                {/* Add number labels for clues */}
                {((rowIndex === 0 && colIndex === 0) || 
                  (rowIndex === 4 && colIndex === 1)) && (
                  <span className="absolute top-0 left-0 text-xs bg-white px-1">
                    {rowIndex === 0 && colIndex === 0 ? '1' : '5'}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Across</h3>
          {Object.entries(CLUES.across).map(([num, clue]) => (
            <p key={num} className="text-sm">{num}. {clue}</p>
          ))}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Down</h3>
          {Object.entries(CLUES.down).map(([num, clue]) => (
            <p key={num} className="text-sm">{num}. {clue}</p>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={checkSolution}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          Check Solution
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentGame, setCurrentGame] = useState('menu');

  const games = [
    { id: 'wordle', name: 'Wordle', component: WordleGame },
    { id: 'connections', name: 'Connections', component: ConnectionsGame },
    { id: 'strands', name: 'Strands', component: StrandsGame },
    { id: 'crossword', name: 'Crossword', component: CrosswordGame }
  ];

  const renderGame = () => {
    if (currentGame === 'menu') {
      return (
        <div className="max-w-lg mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-8">NYT Games</h1>
          <div className="grid grid-cols-2 gap-4">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setCurrentGame(game.id)}
                className="p-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-lg font-semibold"
              >
                {game.name}
              </button>
            ))}
          </div>
        </div>
      );
    }

    const GameComponent = games.find(g => g.id === currentGame)?.component;
    return GameComponent ? <GameComponent /> : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentGame !== 'menu' && (
        <div className="p-4">
          <button
            onClick={() => setCurrentGame('menu')}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <ChevronLeft size={20} />
            Back to Games
          </button>
        </div>
      )}
      {renderGame()}
    </div>
  );
};

export default App;
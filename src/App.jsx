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
                bg-green-200 hover:bg-green-300 rounded text-sm font-semibold text-green-800
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
  const STORAGE_KEY = 'wordle-game-state';
  
  // Load saved state from localStorage
  const loadGameState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        return state;
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
    return {
      guesses: Array(MAX_GUESSES).fill(''),
      currentGuess: '',
      currentRow: 0,
      gameOver: false,
      won: false
    };
  };

  const initialState = loadGameState();
  const [guesses, setGuesses] = useState(initialState.guesses);
  const [currentGuess, setCurrentGuess] = useState(initialState.currentGuess);
  const [currentRow, setCurrentRow] = useState(initialState.currentRow);
  const [gameOver, setGameOver] = useState(initialState.gameOver);
  const [won, setWon] = useState(initialState.won);

  // Save game state to localStorage
  const saveGameState = (newGuesses, newCurrentGuess, newCurrentRow, newGameOver, newWon) => {
    const state = {
      guesses: newGuesses,
      currentGuess: newCurrentGuess,
      currentRow: newCurrentRow,
      gameOver: newGameOver,
      won: newWon
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Update completed games list
      if (newGameOver && newWon) {
        const completedGames = JSON.parse(localStorage.getItem('completed-games') || '[]');
        if (!completedGames.includes('wordle')) {
          completedGames.push('wordle');
          localStorage.setItem('completed-games', JSON.stringify(completedGames));
        }
      }
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  const handleKeyPress = (key) => {
    if (gameOver) return;

    if (key === 'BACKSPACE') {
      const newCurrentGuess = currentGuess.slice(0, -1);
      setCurrentGuess(newCurrentGuess);
      saveGameState(guesses, newCurrentGuess, currentRow, gameOver, won);
    } else if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        const newGuesses = [...guesses];
        newGuesses[currentRow] = currentGuess;
        setGuesses(newGuesses);
        
        if (currentGuess.toUpperCase() === SOLUTION) {
          setWon(true);
          setGameOver(true);
          saveGameState(newGuesses, currentGuess, currentRow, true, true);
        } else if (currentRow === MAX_GUESSES - 1) {
          setGameOver(true);
          saveGameState(newGuesses, '', currentRow, true, false);
        } else {
          const newCurrentRow = currentRow + 1;
          setCurrentRow(newCurrentRow);
          setCurrentGuess('');
          saveGameState(newGuesses, '', newCurrentRow, false, false);
        }
      }
    } else if (currentGuess.length < 5 && key.match(/[A-Z]/)) {
      const newCurrentGuess = currentGuess + key;
      setCurrentGuess(newCurrentGuess);
      saveGameState(guesses, newCurrentGuess, currentRow, gameOver, won);
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
    const initialState = {
      guesses: Array(MAX_GUESSES).fill(''),
      currentGuess: '',
      currentRow: 0,
      gameOver: false,
      won: false
    };
    setGuesses(initialState.guesses);
    setCurrentGuess(initialState.currentGuess);
    setCurrentRow(initialState.currentRow);
    setGameOver(initialState.gameOver);
    setWon(initialState.won);
    
    // Clear from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      const completedGames = JSON.parse(localStorage.getItem('completed-games') || '[]');
      const updatedCompleted = completedGames.filter(game => game !== 'wordle');
      localStorage.setItem('completed-games', JSON.stringify(updatedCompleted));
    } catch (error) {
      console.error('Error clearing game state:', error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Wordle</h1>
        <button onClick={reset} className="p-2 hover:bg-green-200 rounded">
          <RotateCcw size={20} className="text-green-700" />
        </button>
      </div>
      
      <div className="grid grid-rows-6 gap-1 mb-6 max-w-xs mx-auto">
        {Array(MAX_GUESSES).fill().map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-1">
            {Array(5).fill().map((_, colIndex) => {
              const isCurrentRow = rowIndex === currentRow && !gameOver;
              const isCompletedRow = rowIndex < currentRow || (rowIndex === currentRow && gameOver);
              
              let letter = '';
              if (isCompletedRow) {
                letter = guesses[rowIndex][colIndex] || '';
              } else if (isCurrentRow) {
                letter = currentGuess[colIndex] || '';
              }
              
              const status = isCompletedRow ? 
                getLetterStatus(letter, colIndex, guesses[rowIndex]) : '';
              
              return (
                <div
                  key={colIndex}
                  className={`
                    w-12 h-12 border-2 flex items-center justify-center text-lg font-bold
                    ${status === 'correct' ? 'bg-green-500 text-white border-green-500' :
                      status === 'present' ? 'bg-yellow-500 text-white border-yellow-500' :
                      status === 'absent' ? 'bg-gray-500 text-white border-gray-500' :
                      letter ? 'border-green-400 bg-green-50' : 'border-green-300 bg-green-50'}
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
        <div className="text-center mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-lg font-semibold text-green-800">
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
    { words: ['COFFEE', 'BAGELS', 'CROISSANTS', 'PANCAKES'], category: 'HOME BREAKFASTS', color: 'yellow' },
    { words: ['CARMY', 'MABEL', 'TED', 'HOLT'], category: 'CHARACTERS FROM OUR FAVORITE SHOWS', color: 'green' },
    { words: ['SCOT', 'ICE', 'DIEGO', 'RHODE'], category: 'PLACES WE HAVE BEEN, KINDA', color: 'blue' },
    { words: ['SAGE', 'DUSTY', 'LAKE', 'FARM'], category: 'WEDDING/ENGAGEMENT DETAILS MINUS A COLOR', color: 'purple' }
  ];
  

  function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

  // Get all words and shuffle them properly
  const allWords = shuffleArray(GROUPS.flatMap(group => group.words));
  // const allWords = GROUPS.flatMap(group => group.words).sort(() => Math.random() - 0.5);
  const STORAGE_KEY = 'connections-game-state';

  // Load saved state
  const loadGameState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading connections state:', error);
    }
    return {
      words: allWords,
      selected: [],
      solvedGroups: [],
      mistakes: 0,
      gameOver: false
    };
  };

  const initialState = loadGameState();
  const [words, setWords] = useState(initialState.words);
  const [selected, setSelected] = useState(initialState.selected);
  const [solvedGroups, setSolvedGroups] = useState(initialState.solvedGroups);
  const [mistakes, setMistakes] = useState(initialState.mistakes);
  const [gameOver, setGameOver] = useState(initialState.gameOver);

  // Save game state
  const saveGameState = (newWords, newSelected, newSolvedGroups, newMistakes, newGameOver) => {
    const state = {
      words: newWords,
      selected: newSelected,
      solvedGroups: newSolvedGroups,
      mistakes: newMistakes,
      gameOver: newGameOver
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (newGameOver && newSolvedGroups.length === 4) {
        const completedGames = JSON.parse(localStorage.getItem('completed-games') || '[]');
        if (!completedGames.includes('connections')) {
          completedGames.push('connections');
          localStorage.setItem('completed-games', JSON.stringify(completedGames));
        }
      }
    } catch (error) {
      console.error('Error saving connections state:', error);
    }
  };

  const toggleWord = (word) => {
    let newSelected;
    if (selected.includes(word)) {
      newSelected = selected.filter(w => w !== word);
    } else if (selected.length < 4) {
      newSelected = [...selected, word];
    } else {
      return; // Don't change if already 4 selected
    }
    setSelected(newSelected);
    saveGameState(words, newSelected, solvedGroups, mistakes, gameOver);
  };

  const submitGuess = () => {
    if (selected.length !== 4) return;

    const group = GROUPS.find(g => 
      selected.every(word => g.words.includes(word)) && 
      g.words.every(word => selected.includes(word))
    );

    if (group) {
      const newSolvedGroups = [...solvedGroups, group];
      const newWords = words.filter(word => !group.words.includes(word));
      const newSelected = [];
      const newGameOver = newSolvedGroups.length === 4;
      
      setSolvedGroups(newSolvedGroups);
      setWords(newWords);
      setSelected(newSelected);
      
      if (newGameOver) {
        setGameOver(true);
      }
      
      saveGameState(newWords, newSelected, newSolvedGroups, mistakes, newGameOver);
    } else {
      const newMistakes = mistakes + 1;
      const newSelected = [];
      const newGameOver = newMistakes >= 4;
      
      setMistakes(newMistakes);
      setSelected(newSelected);
      
      if (newGameOver) {
        setGameOver(true);
      }
      
      saveGameState(words, newSelected, solvedGroups, newMistakes, newGameOver);
    }
  };

  const shuffle = () => {
    const newWords = [...words].sort(() => Math.random() - 0.5);
    setWords(newWords);
    saveGameState(newWords, selected, solvedGroups, mistakes, gameOver);
  };

  const reset = () => {
    const newWords = allWords.sort(() => Math.random() - 0.5);
    const initialState = {
      words: newWords,
      selected: [],
      solvedGroups: [],
      mistakes: 0,
      gameOver: false
    };
    
    setWords(initialState.words);
    setSelected(initialState.selected);
    setSolvedGroups(initialState.solvedGroups);
    setMistakes(initialState.mistakes);
    setGameOver(initialState.gameOver);
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      const completedGames = JSON.parse(localStorage.getItem('completed-games') || '[]');
      const updatedCompleted = completedGames.filter(game => game !== 'connections');
      localStorage.setItem('completed-games', JSON.stringify(updatedCompleted));
    } catch (error) {
      console.error('Error clearing connections state:', error);
    }
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
        <h1 className="text-2xl font-bold text-green-800">Connections</h1>
        <button onClick={reset} className="p-2 hover:bg-green-200 rounded">
          <RotateCcw size={20} className="text-green-700" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-green-700">Mistakes remaining: {4 - mistakes}</p>
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
              p-2 rounded font-semibold border-2 min-h-16 flex items-center justify-center
              ${word.length > 8 ? 'text-xs' : 'text-sm'}
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
          className="px-4 py-2 bg-green-200 hover:bg-green-300 rounded flex items-center gap-2 text-green-800"
        >
          <Shuffle size={16} />
          Shuffle
        </button>
        <button
          onClick={submitGuess}
          disabled={selected.length !== 4}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-green-100 rounded disabled:opacity-50"
        >
          Submit
        </button>
      </div>

      {gameOver && (
        <div className="text-center mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-lg font-semibold text-green-800">
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
    ['I', 'C', 'C', 'S', 'N','A'],
    ['L', 'O', 'O', 'R', 'B','E'],
    ['B', 'L', 'A', 'C', 'K','B'],
    ['E', 'N', 'C', 'H', 'I','L'],
    ['L', 'I', 'S', 'A', 'D','A'],
    ['L', 'T', 'S', 'E', 'E','U'],
    ['A', 'R', 'E', 'E', 'C','A'],
    ['S', 'O', 'T', 'C', 'H','S'],
  ];

  // Define words to find (you can customize these)
  const WORDS_TO_FIND = ['ENCHILADAS', 'BLACKBEANS', 'CHEESE', 'TORTILLAS', 'SAUCE', 'BROCCOLI'];
  const SPANGRAM = 'ENCHILADAS'; // The word that spans the entire theme
  const STORAGE_KEY = 'strands-game-state';

  // Load saved state
  const loadGameState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading strands state:', error);
    }
    return {
      selectedCells: [],
      foundWords: [],
      foundWordCells: [], // Track which cells belong to each found word
      currentWord: '',
      isSelecting: false
    };
  };

  const initialState = loadGameState();
  const [selectedCells, setSelectedCells] = useState(initialState.selectedCells);
  const [foundWords, setFoundWords] = useState(initialState.foundWords);
  const [foundWordCells, setFoundWordCells] = useState(initialState.foundWordCells || []);
  const [currentWord, setCurrentWord] = useState(initialState.currentWord);
  const [isSelecting, setIsSelecting] = useState(initialState.isSelecting);

  // Save game state
  const saveGameState = (newSelectedCells, newFoundWords, newFoundWordCells, newCurrentWord, newIsSelecting) => {
    const state = {
      selectedCells: newSelectedCells,
      foundWords: newFoundWords,
      foundWordCells: newFoundWordCells,
      currentWord: newCurrentWord,
      isSelecting: newIsSelecting
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (newFoundWords.length === WORDS_TO_FIND.length) {
        const completedGames = JSON.parse(localStorage.getItem('completed-games') || '[]');
        if (!completedGames.includes('strands')) {
          completedGames.push('strands');
          localStorage.setItem('completed-games', JSON.stringify(completedGames));
        }
      }
    } catch (error) {
      console.error('Error saving strands state:', error);
    }
  };

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
      const newIsSelecting = true;
      const newSelectedCells = [cellId];
      const newCurrentWord = GRID[row][col];
      
      setIsSelecting(newIsSelecting);
      setSelectedCells(newSelectedCells);
      setCurrentWord(newCurrentWord);
      saveGameState(newSelectedCells, foundWords, foundWordCells, newCurrentWord, newIsSelecting);
    } else {
      if (selectedCells.includes(cellId)) {
        // Clicking on already selected cell - end selection
        checkWord();
      } else if (selectedCells.length === 0 || isAdjacent(selectedCells[selectedCells.length - 1], cellId)) {
        const newSelectedCells = [...selectedCells, cellId];
        const newCurrentWord = currentWord + GRID[row][col];
        
        setSelectedCells(newSelectedCells);
        setCurrentWord(newCurrentWord);
        saveGameState(newSelectedCells, foundWords, foundWordCells, newCurrentWord, isSelecting);
      }
    }
  };

  const checkWord = () => {
    if (WORDS_TO_FIND.includes(currentWord) && !foundWords.includes(currentWord)) {
      const newFoundWords = [...foundWords, currentWord];
      const newFoundWordCells = [...foundWordCells, [...selectedCells]];
      
      setFoundWords(newFoundWords);
      setFoundWordCells(newFoundWordCells);
      saveGameState([], newFoundWords, newFoundWordCells, '', false);
    } else {
      // Save the current invalid guess state before resetting
      saveGameState(selectedCells, foundWords, foundWordCells, currentWord, isSelecting);
    }
    resetSelection();
  };

  const resetSelection = () => {
    const newSelectedCells = [];
    const newCurrentWord = '';
    const newIsSelecting = false;
    
    setSelectedCells(newSelectedCells);
    setCurrentWord(newCurrentWord);
    setIsSelecting(newIsSelecting);
    saveGameState(newSelectedCells, foundWords, foundWordCells, newCurrentWord, newIsSelecting);
  };

  const reset = () => {
    const initialState = {
      selectedCells: [],
      foundWords: [],
      foundWordCells: [],
      currentWord: '',
      isSelecting: false
    };
    
    setSelectedCells(initialState.selectedCells);
    setFoundWords(initialState.foundWords);
    setFoundWordCells(initialState.foundWordCells);
    setCurrentWord(initialState.currentWord);
    setIsSelecting(initialState.isSelecting);
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      const completedGames = JSON.parse(localStorage.getItem('completed-games') || '[]');
      const updatedCompleted = completedGames.filter(game => game !== 'strands');
      localStorage.setItem('completed-games', JSON.stringify(updatedCompleted));
    } catch (error) {
      console.error('Error clearing strands state:', error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Strands</h1>
        <button onClick={reset} className="p-2 hover:bg-green-200 rounded">
          <RotateCcw size={20} className="text-green-700" />
        </button>
      </div>

      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-700">THEME: <strong>Ready For The Week!</strong></p>
        <p className="text-sm text-green-700">Current word: <strong>{currentWord}</strong></p>
        <p className="text-sm text-green-700">Found: {foundWords.length}/{WORDS_TO_FIND.length}</p>
      </div>

      <div className="grid grid-cols-6 gap-1 mb-6 max-w-xs mx-auto">
        {GRID.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const cellId = getCellId(rowIndex, colIndex);
            const isSelected = selectedCells.includes(cellId);
            const isPartOfFoundWord = foundWordCells.some(wordCells => wordCells.includes(cellId));

            return (
              <button
                key={cellId}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  w-12 h-12 rounded-full text-lg font-bold border-2
                  ${isSelected 
                    ? 'bg-blue-500 text-white border-blue-600' 
                    : isPartOfFoundWord
                    ? 'bg-yellow-200 border-yellow-400'
                    : 'bg-green-50 border-green-300 hover:bg-green-200 text-green-800'}
                `}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>

      <div className="space-y-2 mb-4">
        <h3 className="font-semibold text-green-800">Found Words:</h3>
        {foundWords.map((word, index) => (
          <div key={index} className={`p-2 rounded ${word === SPANGRAM ? 'bg-purple-200' : 'bg-green-200'}`}>
            <span className="text-green-800">{word} {word === SPANGRAM && '(Spangram!)'}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={resetSelection}
          className="px-4 py-2 bg-green-200 hover:bg-green-300 rounded text-green-800"
        >
          Clear Selection
        </button>
        <button
          onClick={checkWord}
          disabled={!currentWord}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-green-100 rounded disabled:opacity-50"
        >
          Submit Word
        </button>
      </div>

      {foundWords.length === WORDS_TO_FIND.length && (
        <div className="text-center mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-lg font-semibold text-green-800">Congratulations! All words found!</p>
        </div>
      )}
    </div>
  );
};

// Simple Crossword Component
const CrosswordGame = () => {
  const GRID_SIZE = 10;
  const SOLUTION = [
    ['', '', '', '', '', '', 'B', 'A', 'R', 'N'],
    ['', '', '', '', '', '', 'A', '', '', ''],
    ['', '', 'B', 'L', 'O', 'C', 'K', '', '', ''],
    ['', '', '', 'A', '', '', 'E', '', '', ''],
    ['', '', '', 'T', '', 'J', '', 'D', '', ''],
    ['', '', '', 'T', '', 'U', '', 'A', '', ''],
    ['', '', 'M', 'E', 'A', 'L', 'P', 'R', 'E', 'P'],
    ['', '', '', '', '', 'Y', '', 'I', '', ''],
    ['', '', '', '', '', '', '', 'O', 'F', 'F'],
    ['', '', '', '', '', '', '', 'S', '', ''],
  ];

  const CLUES = {
    across: {
      1: "The type of venue where we got married",
      2: "Island where we got engaged",
      6: "How we start the week",
      7: "See 1 Down"
    },
    down: {
      1: "Yearly competition show we watch with yummy food and cozy vibes, familiarly",
      3: "Great pairing with a croissant or bagel",
      4: "Month when we got married",
      5: "Our go to pizza spot nearby"
    }
  };

  // Define clue number positions based on your puzzle
  const CLUE_POSITIONS = {
    across: {
      1: { row: 0, col: 6 },  // BARN
      2: { row: 2, col: 2 },  // BLOCK
      6: { row: 6, col: 2 },  // MEALPREP
      7: { row: 8, col: 7 }   // OFF
    },
    down: {
      1: { row: 0, col: 6 },  // BAKE (sharing position with 1 across)
      3: { row: 2, col: 3 },  // LATTE
      4: { row: 4, col: 5 },  // JULY (starts at J)
      5: { row: 4, col: 7 }   // DARIOS (starts at D)
    }
  };

  const STORAGE_KEY = 'crossword-game-state';

  // Create empty grid
  const createEmptyGrid = () => Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(''));

  // Load saved state with validation
  const loadGameState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate grid dimensions
        if (parsed.grid && 
            parsed.grid.length === GRID_SIZE && 
            parsed.grid.every(row => row && row.length === GRID_SIZE)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading crossword state:', error);
    }
    // Return default state if loading fails or grid is invalid
    return {
      grid: createEmptyGrid(),
      selectedCell: null,
      timeElapsed: 0,
      isCompleted: false
    };
  };

  const initialState = loadGameState();
  const [grid, setGrid] = useState(initialState.grid);
  const [selectedCell, setSelectedCell] = useState(initialState.selectedCell);
  const [timeElapsed, setTimeElapsed] = useState(initialState.timeElapsed);
  const [isCompleted, setIsCompleted] = useState(initialState.isCompleted);

  // Timer effect
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  // Save timeElapsed to localStorage whenever it changes
  useEffect(() => {
    saveGameState(grid, selectedCell, timeElapsed, isCompleted);
  }, [timeElapsed]);

  // Auto-check solution whenever grid changes
  useEffect(() => {
    if (isCompleted) return;

    // Check if all non-black squares are filled
    const isGridComplete = grid.every((row, rowIndex) =>
      row.every((cell, colIndex) =>
        SOLUTION[rowIndex][colIndex] === '' || cell !== ''
      )
    );

    if (isGridComplete) {
      // Check if solution is correct
      const isCorrect = grid.every((row, rowIndex) =>
        row.every((cell, colIndex) =>
          SOLUTION[rowIndex][colIndex] === '' || cell === SOLUTION[rowIndex][colIndex]
        )
      );

      if (isCorrect) {
        setIsCompleted(true);
        // Mark as completed
        const completedGames = JSON.parse(localStorage.getItem('completed-games') || '[]');
        if (!completedGames.includes('crossword')) {
          completedGames.push('crossword');
          localStorage.setItem('completed-games', JSON.stringify(completedGames));
        }
        saveGameState(grid, selectedCell, timeElapsed, true);
      }
    }
  }, [grid, timeElapsed, isCompleted]);

  // Save game state
  const saveGameState = (newGrid, newSelectedCell, newTimeElapsed, newIsCompleted) => {
    const state = {
      grid: newGrid,
      selectedCell: newSelectedCell,
      timeElapsed: newTimeElapsed,
      isCompleted: newIsCompleted
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving crossword state:', error);
    }
  };

  const handleCellChange = (row, col, value) => {
    if (SOLUTION[row][col] === '' || isCompleted) return;
    
    const newGrid = [...grid];
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);
    saveGameState(newGrid, selectedCell, timeElapsed, isCompleted);
  };

  const reset = () => {
    const newGrid = createEmptyGrid();
    setGrid(newGrid);
    setSelectedCell(null);
    setTimeElapsed(0);
    setIsCompleted(false);
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      const completedGames = JSON.parse(localStorage.getItem('completed-games') || '[]');
      const updatedCompleted = completedGames.filter(game => game !== 'crossword');
      localStorage.setItem('completed-games', JSON.stringify(updatedCompleted));
    } catch (error) {
      console.error('Error clearing crossword state:', error);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get clue number for a cell
  const getClueNumber = (row, col) => {
    const numbers = [];
    
    // Check across clues
    Object.entries(CLUE_POSITIONS.across).forEach(([num, pos]) => {
      if (pos.row === row && pos.col === col) {
        numbers.push(num);
      }
    });
    
    // Check down clues
    Object.entries(CLUE_POSITIONS.down).forEach(([num, pos]) => {
      if (pos.row === row && pos.col === col && !numbers.includes(num)) {
        numbers.push(num);
      }
    });
    
    return numbers.length > 0 ? numbers[0] : null;
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Crossword</h1>
        <div className="flex items-center gap-4">
          <div className="text-lg font-mono text-green-700 bg-green-50 px-3 py-1 rounded border border-green-200">
            {formatTime(timeElapsed)}
          </div>
          <button onClick={reset} className="p-2 hover:bg-green-200 rounded">
            <RotateCcw size={20} className="text-green-700" />
          </button>
        </div>
      </div>

      {isCompleted && (
        <div className="text-center mb-4 p-4 bg-gradient-to-r from-green-200 to-yellow-200 rounded-lg border border-green-300">
          <p className="text-lg font-semibold text-green-800">
            🎉 Congratulations! Puzzle solved in {formatTime(timeElapsed)}!
          </p>
        </div>
      )}

      <div className="grid grid-cols-10 gap-0.5 mb-6 mx-auto" style={{width: 'fit-content'}}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isBlack = SOLUTION[rowIndex][colIndex] === '';
            const cellId = `${rowIndex}-${colIndex}`;
            const clueNumber = getClueNumber(rowIndex, colIndex);
            
            return (
              <div key={cellId} className="relative w-8 h-8">
                {isBlack ? (
                  <div className="w-full h-full bg-gray-800"></div>
                ) : (
                  <>
                    <input
                      type="text"
                      maxLength="1"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      onClick={() => {
                        setSelectedCell(cellId);
                        saveGameState(grid, cellId, timeElapsed, isCompleted);
                      }}
                      className={`
                        w-full h-full border-2 text-center text-sm font-bold text-green-800
                        ${selectedCell === cellId ? 'border-blue-500 bg-blue-50' : 'border-green-300'}
                        ${isCompleted ? 'bg-green-100' : 'bg-white'}
                        focus:outline-none focus:border-blue-500
                      `}
                      disabled={isCompleted}
                    />
                    {clueNumber && (
                      <span className="absolute top-0 left-0 text-xs font-semibold px-0.5 text-gray-700 pointer-events-none">
                        {clueNumber}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-4 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div>
          <h3 className="font-semibold mb-2 text-green-800">Across</h3>
          {Object.entries(CLUES.across).map(([num, clue]) => (
            <p key={num} className="text-sm text-green-700 mb-1">
              <span className="font-semibold">{num}.</span> {clue}
            </p>
          ))}
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-green-800">Down</h3>
          {Object.entries(CLUES.down).map(([num, clue]) => (
            <p key={num} className="text-sm text-green-700 mb-1">
              <span className="font-semibold">{num}.</span> {clue}
            </p>
          ))}
        </div>
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

  // Get completed games from localStorage
  const getCompletedGames = () => {
    try {
      return JSON.parse(localStorage.getItem('completed-games') || '[]');
    } catch (error) {
      console.error('Error loading completed games:', error);
      return [];
    }
  };

  const completedGames = getCompletedGames();

  // Reset all puzzles function
  const resetAllPuzzles = () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all puzzles? This will clear all progress and cannot be undone."
    );
    
    if (confirmReset) {
      try {
        // Clear all game states
        localStorage.removeItem('wordle-game-state');
        localStorage.removeItem('connections-game-state');
        localStorage.removeItem('strands-game-state');
        localStorage.removeItem('crossword-game-state');
        localStorage.removeItem('completed-games');
        
        // Force a page refresh to reset all component states
        window.location.reload();
      } catch (error) {
        console.error('Error resetting puzzles:', error);
      }
    }
  };


  const renderGame = () => {
    if (currentGame === 'menu') {
      const allGamesCompleted = games.every(game => completedGames.includes(game.id));
      
      return (
        <div className="max-w-lg mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-green-800">Happy Anniversary!</h1>
          
          {allGamesCompleted && (
            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-200 to-green-200 rounded-lg border-2 border-yellow-400 text-center">
              <div className="text-4xl mb-2">🎉🏆🎉</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">You did it!!</h2>
              <p className="text-green-700">I love you muchísimo!</p>
              <p className="text-green-600 text-sm mt-1">- Chuy</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {games.map((game) => {
              const isCompleted = completedGames.includes(game.id);
              return (
                <button
                  key={game.id}
                  onClick={() => setCurrentGame(game.id)}
                  className={`
                    p-6 rounded-lg text-lg font-semibold transition-colors
                    ${isCompleted 
                      ? 'bg-rose-300 hover:bg-rose-400 text-green-100' 
                      : 'bg-blue-500 hover:bg-blue-600 text-green-100'}
                  `}
                >
                  {game.name}
                  {isCompleted && (
                    <div className="text-sm font-normal mt-1">✓ Completed</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    const GameComponent = games.find(g => g.id === currentGame)?.component;
    return GameComponent ? <GameComponent /> : null;
  };

  return (
    <div className="min-h-screen bg-green-100">
      {currentGame !== 'menu' && (
        <div className="p-4">
          <button
            onClick={() => setCurrentGame('menu')}
            className="flex items-center gap-2 text-green-700 hover:text-green-900"
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
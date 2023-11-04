import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { quotes } from "./api/data.js";
import Symbol from "../components/Symbol";

export default function Home() {
  const [quote, setQuote] = useState({}); // the quote object with an author and phrase
  const [crypto, setCrypto] = useState([]); // An array where each item is a random symbol in the phrase
  const [cryptoPhrase, setCryptoPhrase] = useState([]); // the crypto phrase divided into rows
  const [selectedSymbols, setSelectedSymbols] = useState([]); // which items are currently selected
  const [guessed, setGuessed] = useState([]); // which items have a valid guess
  const [ended, setEnded] = useState(false); // whether the puzzle has ended (guessed correctly)
  const symbolsPool = [
    "😂",
    "😀",
    "🙃",
    "🥰",
    "😍",
    "🤩",
    "😜",
    "🤑",
    "🤔",
    "🙄",
    "🥶",
    "🥵",
    "🥸",
    "😱",
    "😈",
    "🤡",
    "💩",
    "💖",
    "👍",
    "💪",
    "👄",
    "🐶",
    "🦊",
    "🦄",
    "🐷",
    "🐤",
    "🐸",
    "🐙",
    "🐝",
    "🌹",
    "🌲",
    "🍊",
    "🥑",
    "🌽",
    "🥞",
    "🍕",
    "🍩",
    "🎂",
    "🌎",
    "🍜",
    "🍹",
    "🚗",
    "🛑",
    "🚀",
    "⛄",
    "🎃",
    "🎁",
    "🏈",
    "🧶",
    "🪰",
  ];

  const letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const bqRef = useRef(); // block quote ref (for layout purposes)
  const inRef = useRef(); // reference to the input
  const phraseRef = useRef(); // reference to the crypto phrase fo use in functions
  phraseRef.current = crypto; //capture crypto to use in callback

  //callback when Symbol button is pressed
  const selectAllSame = (symbol) => {
    let selectedSymbolsTemp = [];
    for (let index = 0; index < phraseRef.current.length; index++) {
      const s = phraseRef.current[index];
      if (
        s != undefined &&
        s.char != undefined &&
        s.char.localeCompare(symbol) === 0
      ) {
        selectedSymbolsTemp.push(true);
      } else {
        selectedSymbolsTemp.push(false);
      }
    }

    setSelectedSymbols([...selectedSymbolsTemp]);
    if (inRef.current !== undefined && inRef.current !== null)
      inRef.current.focus({
        preventScroll: true,
      }); // focus the input to recieve a guess without scrolling
  };

  // when a key is presed in the input
  const enterGuess = (event) => {
    const p = [...crypto];
    const g = [...guessed];
    for (let index = 0; index < selectedSymbols.length; index++) {
      const s = selectedSymbols[index];
      //if it's selected, enter the guess an display it, change status to guessed
      if (s == true && letters.includes(event.key.toUpperCase())) {
        p[index].guess = event.key.toUpperCase();
        p[index].char = event.key.toUpperCase();
        g[index] = true;
      } else {
        // if that letter was already guessed, reset to original char
        if (p[index].guess == event.key.toUpperCase()) {
          p[index].char = p[index].orig; // reset the char
          p[index].guess = null;
          g[index] = false; // mark as ungessed
        }
      }
    }
    setCrypto([...p]);
    setGuessed([...g]);
    inRef.current.value = "";
    inRef.current.focus({
      preventScroll: true,
    });
    isSolved();
  };

  const resetPuzzle = () => {
    let temp = crypto;
    temp.forEach((c) => {
      if (c.guessable === true) {
        c.char = c.orig;
      }
    });
    const g = Array(guessed.length).fill(false);
    setCrypto([...temp]);
    setGuessed([...g]);
  };

  const newPuzzle = () => {
    setEnded(false);
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  //Whether the puzzle is completed
  function isSolved() {
    let guesses = 0;
    crypto.forEach((guess) => {
      if (guess.guessable) {
        if (guess.guess == guess.answer) {
          guesses++;
        }
      } else {
        guesses++;
      }
    });
    if (guesses == crypto.length) {
      setEnded(true);
    }
  }

  //divide the phrase into rows so words aren't broken up
  function breakIntoRows(phrase, length) {
    if (phrase.length < length) {
      return phrase;
    } else {
      let newPhrase = [];
      let counter = length;
      if (
        phrase[length] &&
        phrase[length].props.symbol.char.localeCompare(" ") !== 0
      ) {
        while (
          phrase[counter].props.symbol.char.localeCompare(" ") !== 0 &&
          counter !== 0
        ) {
          counter--;
        }
      }
      if (counter > 0) {
        for (let index = 0; index < counter; index++) {
          newPhrase.push(phrase[index]);
        }
        newPhrase.push(<br key={"brake" + phrase.slice(counter).length} />);

        return newPhrase.concat(
          breakIntoRows(phrase.slice(counter + 1), length)
        );
      } else {
        for (let index = 0; index < length; index++) {
          newPhrase.push(phrase[index]);
        }
        newPhrase.push(<br key={"brake" + phrase.slice(length).length} />);

        return newPhrase.concat(breakIntoRows(phrase.slice(length), length));
      }
    }
  }
  // shuffle an array
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // on load set a random quote
  useEffect(() => {
    const index = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[index]);
  }, []);

  // when setting a new quote, set up the game
  useEffect(() => {
    const symbolsArray = shuffle(symbolsPool).slice(0, letters.length);

    if (quote.phrase !== undefined) {
      const charsArray = [...quote.phrase];
      let selectedSymbolsTemp = Array(charsArray.length).fill(false);
      let guessedTemp = Array(charsArray.length).fill(false);
      setSelectedSymbols([...selectedSymbolsTemp]);
      setGuessed([...guessedTemp]);
      const cryptoArray = charsArray.map((char) => {
        let r = {
          char: char,
          guessable: false,
        };
        letters.forEach((letter, i) => {
          if (letter.localeCompare(char.toUpperCase()) === 0) {
            r = {
              char: symbolsArray[i],
              orig: symbolsArray[i],
              guessable: true,
              answer: letter.toUpperCase(),
            };
          }
        });
        return r;
      });
      setCrypto(cryptoArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote]);

  // set/update the symbols when quote or selectedSymbols change
  useEffect(() => {
    const width = bqRef.current.offsetWidth;
    const tileWidth = width >= 768 ? 55 : 40;
    const tilesXRow = parseInt(width / tileWidth);
    let phrase = crypto.map((symbol, i) => {
      return (
        <Symbol
          key={"symbol" + symbol.orig + i}
          guess={""}
          symbol={symbol}
          callback={selectAllSame}
          selected={selectedSymbols[i]}
          guessed={guessed[i]}
          ended={ended}
        />
      );
    });
    const tiles = breakIntoRows(phrase, tilesXRow);
    setCryptoPhrase(tiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crypto, selectedSymbols]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Cryptograma by Alicia Ramírez</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Cryptograma</h1>
        <p>
          To reveal the quote, click/tap on an emoji and enter a letter with
          your keyboard. The same emoji represents the same letter. (
          <a href="https://en.wikipedia.org/wiki/Cryptogram">
            Learn more about Cryptograms
          </a>
          )
        </p>
        <div className="tools">
          <button className="reset" type="button" onClick={resetPuzzle}>
            Reset puzzle
          </button>
          <button className="new" type="button" onClick={newPuzzle}>
            New puzzle
          </button>
        </div>
        <blockquote ref={bqRef} key={1}>
          {cryptoPhrase}
        </blockquote>
        <p>— {quote.author}</p>
        <input
          type="text"
          className="hidden-input"
          ref={inRef}
          onKeyDown={enterGuess}
        />
      </main>
      <footer className={styles.footer}>
        <a href="https://aliciaramirez.com">By Alicia Ramírez</a>
      </footer>
    </div>
  );
}

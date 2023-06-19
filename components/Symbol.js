export default function Symbol({
  symbol,
  guess,
  callback,
  selected,
  guessed,
  ended,
}) {
  let content = guess;
  let enabled = "disabled";
  let className = "";

  if (guess.localeCompare("") === 0) {
    content = symbol.char;
  }
  if (symbol.guessable === true) {
    enabled = "";
  } else {
    className += "punct";
  }
  if (content.localeCompare(" ") === 0) {
    className += " space";
  }

  if (selected) {
    className += " active";
  }

  if (guessed) {
    className += " guessed";
  }

  if (ended) {
    className += " ended";
    enabled = "disbled";
  }

  function handleClick() {
    callback(symbol.char);
  }

  return (
    <button onClick={handleClick} disabled={enabled} className={className}>
      {content}
    </button>
  );
}

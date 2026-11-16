/**
 * The hero keeps its original word wrapping. Motion is owned by the page timeline,
 * so it cannot run underneath IntroOverlay. All words render visibly without JS.
 */
type BlurTextProps = {
  as?: "h1" | "h2";
  id?: string;
  text?: string;
  className?: string;
};

export default function BlurText({ as: Heading = "h1", id, text = "", className = "" }: BlurTextProps) {
  return (
    <Heading id={id} className={className} aria-label={text}>
      {text.split("\n").map((line, lineIndex) => {
        const words = line.split(" ").reduce<string[]>((groups, word) => {
          if (word === "&" && groups.length > 0) groups[groups.length - 1] += `\u00a0${word}`;
          else groups.push(word);
          return groups;
        }, []);

        return (
          <span className="blur-text-line" key={lineIndex} aria-hidden="true">
            {words.map((word, index) => (
              <span className="motion-word-mask" key={index}>
                <span className="motion-word">
                  {word}{index < words.length - 1 ? "\u00a0" : ""}
                </span>
              </span>
            ))}
          </span>
        );
      })}
    </Heading>
  );
}

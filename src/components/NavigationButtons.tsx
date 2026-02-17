interface NavigationButtonsProps {
  canGoBack: boolean;
  controlsLocked: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function NavigationButtons({
  canGoBack,
  controlsLocked,
  onPrevious,
  onNext,
}: NavigationButtonsProps) {
  return (
    <div className="controls-row">
      <button
        className="btn"
        onClick={onPrevious}
        disabled={!canGoBack || controlsLocked}
        aria-label="Previous character"
      >
        Previous character
      </button>
      <button
        className="btn"
        onClick={onNext}
        disabled={controlsLocked}
        aria-label="Next character"
      >
        Next character
      </button>
    </div>
  );
}

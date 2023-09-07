type Props = {
  current: number;
  max: number;
};

function Progress({ current, max }: Props) {
  return (
    <div
      className="tooltip tooltip-bottom flex flex-col"
      data-tip={`${current} / ${max}`}
    >
      <div className="self-start">Progress</div>
      <progress
        className="progress progress-success w-56"
        max={max}
        value={current}
      ></progress>
    </div>
  );
}

export default Progress;

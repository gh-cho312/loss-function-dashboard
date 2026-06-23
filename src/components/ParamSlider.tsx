type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
};

export function ParamSlider({ label, value, min, max, step, onChange }: Props) {
  return (
    <div className="slider-row">
      <div className="slabel">
        <span>{label}</span>
        <span className="sval">{Number.isInteger(step) ? value : value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

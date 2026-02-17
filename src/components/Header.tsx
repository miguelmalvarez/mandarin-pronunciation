interface HeaderProps {
  recorderSupported: boolean;
}

export function Header({ recorderSupported }: HeaderProps) {
  return (
    <div className="header">
      <div>
        <h1 className="title">Mandarin Pronunciation Drill</h1>
        <p className="subtitle">Hear, record, replay. Fast practice for common characters.</p>
      </div>
      {!recorderSupported && <span className="pill">Recording unsupported</span>}
    </div>
  );
}

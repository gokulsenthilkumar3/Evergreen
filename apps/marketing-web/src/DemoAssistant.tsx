import { useState } from 'react';
import '../../../packages/portal-ui/assistant.css';

/** Local design preview only: intentionally has no endpoint or network transport. */
export default function DemoAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [preview, setPreview] = useState(false);
  if (!open) return <div className="eg-assistant-dock"><button className="eg-assistant-launcher" onClick={() => setOpen(true)}>Scout · Demo preview</button></div>;
  return <div className="eg-assistant-dock"><section className="eg-assistant eg-assistant-floating" aria-label="Scout demo preview">
    <header className="eg-assistant-header"><div><h2>Scout</h2><p>Design preview · AI is disconnected</p></div><button type="button" aria-label="Close Scout preview" onClick={() => setOpen(false)}>Close</button></header>
    <p className="eg-assistant-status">This theme shows the assistant experience. Messages stay on this page and are never sent to Groq.</p>
    <form className="eg-assistant-form" onSubmit={event => { event.preventDefault(); setPreview(true); }}>
      <label htmlFor="demo-scout-question">Try the message composer</label>
      <textarea id="demo-scout-question" value={question} maxLength={2000} onChange={event => {setQuestion(event.target.value);setPreview(false);}} placeholder="What would you explore in your mill?" />
      <button type="submit" disabled={!question.trim()}>Preview interaction</button>
    </form>
    {preview && <p className="eg-assistant-status" role="status">Preview only. No AI answer was generated and no message was sent.</p>}
  </section></div>;
}

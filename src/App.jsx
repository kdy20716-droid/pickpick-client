import React, { useState } from "react";
import Header from "../comments/Header.jsx";
import CommentApp from "../comments/Comments.jsx";
import "./App.css";

function App() {
  const [open, setOpen] = useState(true);

  return (
    <div className="app">
      <Header />

      {open && <CommentApp onClose={() => setOpen(false)} />}
    </div>
  );
}

export default App;

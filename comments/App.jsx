import React, { useState } from "react";
import CommentModal from "./CommentModal";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>댓글 열기</button>

      {open && <CommentModal />}
    </div>
  );
}

export default App;

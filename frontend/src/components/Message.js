import React from 'react';
import './Message.css';

function Message({ text, type }) {
  return (
    <div className={`message ${type}`}>
      {text}
    </div>
  );
}

export default Message;

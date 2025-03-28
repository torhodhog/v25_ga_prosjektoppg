'use client'

import React from "react";

const ChatbotButton = () => {
  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2">
      <div className="bg-red-400 p-4 shadow-lg rounded-md mx-auto">
        <iframe 
          src="https://www.stack-ai.com/chat/67dac009e247878d158d9f9f-6bxvIQclK5VwJtlt1W898Y" 
          width="350px" 
          height="500px"
          style={{ border: "none", borderRadius: "20px" }}
        ></iframe>
      </div>
    </div>
  );
};

export default ChatbotButton;
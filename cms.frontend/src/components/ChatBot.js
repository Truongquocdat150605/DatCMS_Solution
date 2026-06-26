import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './ChatBot.css';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Xin chào! Mình là trợ lý ảo của CMS Store. Mình có thể giúp gì cho bạn?", sender: "bot" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storeContext, setStoreContext] = useState("");
  const messagesEndRef = useRef(null);

  // Lấy API key từ biến môi trường
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  // Dạy cho Bot biết cửa hàng đang bán gì bằng cách gọi API ngầm
  useEffect(() => {
    async function fetchKnowledge() {
      try {
        const res = await fetch('https://localhost:7048/api/Products');
        if (res.ok) {
          const products = await res.json();
          // Trích xuất tên, giá và số lượng
          const productList = products.map(p => `- ${p.name} (Giá: ${p.price.toLocaleString()}đ, Còn hàng: ${p.stockQuantity})`).join('\n');
          
          const knowledge = `
THÔNG TIN CỬA HÀNG CMS STORE (Dùng để tư vấn cho khách):
1. Danh sách sản phẩm đang bán:
${productList}

2. Chính sách mua hàng:
- Phí vận chuyển (Ship): Mặc định là 30.000 VNĐ cho mọi đơn hàng.
- Phương thức thanh toán: Hỗ trợ 3 hình thức: Tiền mặt khi nhận hàng (COD), Chuyển khoản qua mã QR (PayOS), và Thanh toán thẻ (Stripe).
- Khi khách muốn mua hàng, hãy hướng dẫn khách bấm "Thêm vào giỏ" và vào trang "Giỏ hàng" để thanh toán.
`;
          setStoreContext(knowledge);
        }
      } catch (e) {
        console.error("Lỗi lấy dữ liệu dạy Bot:", e);
      }
    }
    fetchKnowledge();
  }, []);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setMessages(prev => [...prev, { text: userMsg, sender: "user" }]);
    setIsLoading(true);

    try {
      if (!apiKey) {
        throw new Error("Chưa cấu hình API Key. Vui lòng thêm REACT_APP_GEMINI_API_KEY vào file .env");
      }

      // Khởi tạo Gemini API
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Sử dụng model gemini-2.5-flash tương thích với key

      // Chuẩn bị ngữ cảnh cho bot
      const systemPrompt = `Bạn là trợ lý ảo thân thiện, xưng là "mình" và gọi khách hàng là "bạn". Nhiệm vụ của bạn là tư vấn bán hàng. 
Tuyệt đối KHÔNG BỊA ĐẶT sản phẩm không có trong danh sách. Nếu khách hỏi sản phẩm ngoài danh sách, hãy nói cửa hàng chưa kinh doanh mặt hàng đó.
${storeContext}`;
      const prompt = `${systemPrompt}\n\nKhách hàng: ${userMsg}\nTrợ lý ảo:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botReply = response.text();

      setMessages(prev => [...prev, { text: botReply, sender: "bot" }]);
    } catch (error) {
      console.error("Lỗi Chatbot:", error);
      setMessages(prev => [...prev, { 
        text: "Xin lỗi, hiện tại mình đang gặp sự cố kết nối. Vui lòng thử lại sau nhé!", 
        sender: "bot" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Trợ lý ảo CMS Store</span>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>✖</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message loading">
                Đang gõ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="chatbot-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={isLoading}
            />
            <button type="submit" className="chatbot-send-btn" disabled={isLoading || !inputMessage.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

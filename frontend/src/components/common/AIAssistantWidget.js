import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const AIAssistantWidget = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Hello! I am PageHaven’s AI Literary Curator. How can I help you discover your next great read today?',
      books: [],
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/ask', { message: textToSend.trim() });
      if (res.data.success) {
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.data.data.reply,
          books: res.data.data.recommendedBooks || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'I apologize, but I encountered an issue retrieving books right now. Please try asking again!',
          books: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  const handleQuickAdd = (book) => {
    addToCart(book, 1);
    showToast(`Added "${book.title}" to cart!`, 'success');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-widget-trigger animate-bounce-subtle"
          onClick={() => setIsOpen(true)}
          title="Ask AI Book Assistant"
          aria-label="Open AI Book Assistant"
        >
          <div className="ai-trigger-spark">
            <Sparkles size={18} color="#f59e0b" />
          </div>
          <Bot size={22} color="white" />
          <span className="ai-trigger-label">AI Curator</span>
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div className="ai-widget-window animate-slide-up" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="ai-widget-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="ai-bot-avatar">
                <Bot size={20} color="white" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  PageHaven AI Assistant
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                  Live catalog discovery & curator
                </span>
              </div>
            </div>

            <button
              type="button"
              className="ai-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="ai-quick-prompts">
            <button
              type="button"
              className="ai-prompt-chip"
              onClick={() => handlePresetPrompt('Suggest books for beginners')}
            >
              🌱 Beginner Reads
            </button>
            <button
              type="button"
              className="ai-prompt-chip"
              onClick={() => handlePresetPrompt('Find books under $20')}
            >
              🏷️ Under $20
            </button>
            <button
              type="button"
              className="ai-prompt-chip"
              onClick={() => handlePresetPrompt('Best Self-Help and Mindset books')}
            >
              ⚡ Self-Help
            </button>
            <button
              type="button"
              className="ai-prompt-chip"
              onClick={() => handlePresetPrompt('Award-winning Fiction novels')}
            >
              📖 Fiction
            </button>
          </div>

          {/* Message List */}
          <div className="ai-messages-list">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-message-row ${msg.sender === 'user' ? 'user-row' : 'assistant-row'}`}
              >
                <div className={`ai-message-bubble ${msg.sender === 'user' ? 'user' : 'assistant'}`}>
                  <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{msg.text}</p>

                  {/* Render Book Cards if attached */}
                  {msg.books && msg.books.length > 0 && (
                    <div className="ai-books-grid">
                      {msg.books.map((b) => (
                        <div key={b._id} className="ai-book-card">
                          <img
                            src={b.image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'}
                            alt=""
                            className="ai-book-thumb"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                            }}
                          />
                          <div className="ai-book-info">
                            <Link
                              to={`/book/${b._id}`}
                              className="ai-book-title"
                              title={b.title}
                              onClick={() => setIsOpen(false)}
                            >
                              {b.title}
                            </Link>
                            <span className="ai-book-author">by {b.author}</span>
                            <div className="ai-book-meta-row">
                              <span className="ai-book-price">
                                ${Number(b.price).toFixed(2)}
                              </span>
                              <button
                                type="button"
                                className="ai-card-add-btn"
                                onClick={() => handleQuickAdd(b)}
                                title="Add to Cart"
                              >
                                <ShoppingBag size={12} />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-message-row assistant-row">
                <div className="ai-message-bubble assistant">
                  <div className="ai-typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="ai-widget-footer"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything (e.g. books for students, sci-fi under $15)..."
              className="ai-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={isLoading || !inputMessage.trim()}
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistantWidget;

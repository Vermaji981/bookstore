import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How fast is bookstore delivery and shipping?',
    a: 'Orders placed on business days before 2:00 PM EST are packaged and dispatched the same day. Standard delivery takes 2 to 4 business days. Expedited next-day courier is also available during checkout.',
  },
  {
    q: 'How does payment processing work with Stripe?',
    a: 'We use Stripe, a PCI Level 1 Service Provider—the highest security grade in the payment industry. Your card numbers and CVV codes are securely processed and never stored on our servers.',
  },
  {
    q: 'Can I track my package after ordering?',
    a: 'Yes! Upon checkout, you will receive a unique 24-character Order ID. You can enter this ID on our Track Order page at any time to monitor the exact milestone of your package from packaging to doorstep delivery.',
  },
  {
    q: 'What is your 30-Day Return and Refund Policy?',
    a: 'If your book arrives damaged or does not meet your expectations, you may return it in its original condition within 30 days of delivery for a full refund or exchange. Return postage is covered for defective or incorrect items.',
  },
  {
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes, Cash on Delivery is supported for select regional delivery zones. You can choose COD directly at the payment step of checkout.',
  },
  {
    q: 'How do discount coupons work?',
    a: 'Simply enter your coupon code (e.g. BOOKWORM for 10% off or WELCOME20 for 20% off) in your Shopping Cart before proceeding to checkout. The discount will calculate automatically on all eligible titles.',
  },
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
      <div className="container-sm">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <HelpCircle size={28} />
          </div>
          <h1 className="title-lg font-serif">Frequently Asked Questions</h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.35rem' }}>
            Find answers to common questions about orders, payments, shipping, and returns.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  style={{
                    width: '100%',
                    padding: '1.15rem clamp(1rem, 3.5vw, 1.5rem)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                    fontWeight: 700,
                    color: isOpen ? 'var(--primary)' : '#0f172a',
                    gap: '0.75rem',
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={20} flexShrink={0} /> : <ChevronDown size={20} color="#94a3b8" flexShrink={0} />}
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 clamp(1rem, 3.5vw, 1.5rem) 1.5rem clamp(1rem, 3.5vw, 1.5rem)',
                      color: '#475569',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '1rem',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;

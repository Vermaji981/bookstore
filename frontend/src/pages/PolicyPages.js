import React from 'react';
import { Shield, FileText, RotateCcw, Truck } from 'lucide-react';

export const PrivacyPolicyPage = () => (
  <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
    <div className="container-sm">
      <div style={{ backgroundColor: 'white', borderRadius: 'clamp(16px, 4vw, 24px)', padding: 'clamp(1.25rem, 5vw, 3rem)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Shield size={28} color="var(--primary)" />
          <h1 className="title-lg font-serif">Privacy Policy</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>Last Updated: March 2026</p>

        <div style={{ color: '#334155', fontSize: '1rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p>
            At PageHaven Bookstore, we hold reader privacy in the highest regard. This Privacy Policy details how we collect, safeguard, and utilize your personal information when you browse our catalog, create an account, and purchase books.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>1. Information We Collect</h3>
          <p>
            We collect personal identification information including your full name, email address, shipping delivery address, and phone number when you place an order or register an account. We do not store sensitive payment card numbers on our servers.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>2. Payment Card Security</h3>
          <p>
            All credit card and digital payment transactions are tokenized and processed securely through the Stripe Payment Gateway, adhering to strict PCI-DSS Level 1 compliance standards.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>3. How We Use Your Data</h3>
          <p>
            Your information is exclusively utilized to fulfill orders, generate shipping labels, send milestone delivery tracking updates, and provide customized literary recommendations with your consent.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
    <div className="container-sm">
      <div style={{ backgroundColor: 'white', borderRadius: 'clamp(16px, 4vw, 24px)', padding: 'clamp(1.25rem, 5vw, 3rem)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <FileText size={28} color="var(--primary)" />
          <h1 className="title-lg font-serif">Terms & Conditions</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>Last Updated: March 2026</p>

        <div style={{ color: '#334155', fontSize: '1rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p>
            Welcome to PageHaven. By visiting our website or ordering books from our catalog, you agree to be bound by these Terms and Conditions.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>1. Catalog Accuracy & Pricing</h3>
          <p>
            We strive to display accurate pricing, edition specifications, and inventory availability for all books. In the event of an inadvertent typographical error, we reserve the right to cancel or adjust affected orders prior to dispatch.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>2. User Accounts & Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account password and restricting unauthorized access to your device.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const ReturnPolicyPage = () => (
  <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
    <div className="container-sm">
      <div style={{ backgroundColor: 'white', borderRadius: 'clamp(16px, 4vw, 24px)', padding: 'clamp(1.25rem, 5vw, 3rem)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <RotateCcw size={28} color="#f59e0b" />
          <h1 className="title-lg font-serif">Return & Refund Policy</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>30-Day Reader Guarantee</p>

        <div style={{ color: '#334155', fontSize: '1rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p>
            We want you to adore every book you purchase from PageHaven. If you are not completely satisfied with your selection, you may return the item within 30 days of receipt.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Return Eligibility</h3>
          <p>
            Books must be in unread, undamaged original condition with all accompanying dust jackets or slipcases intact.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Refund Processing</h3>
          <p>
            Once received and inspected at our distribution depot, refunds are credited back to your original payment method within 3 to 5 business days.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const ShippingPolicyPage = () => (
  <div className="section animate-fade-in" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
    <div className="container-sm">
      <div style={{ backgroundColor: 'white', borderRadius: 'clamp(16px, 4vw, 24px)', padding: 'clamp(1.25rem, 5vw, 3rem)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Truck size={28} color="#10b981" />
          <h1 className="title-lg font-serif">Shipping & Delivery Policy</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>Dispatch & Carrier Guidelines</p>

        <div style={{ color: '#334155', fontSize: '1rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p>
            We take extreme care in packaging your books to ensure they arrive in pristine collector condition.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Free Delivery Threshold</h3>
          <p>
            All domestic orders with a subtotal of $35.00 or higher qualify for complimentary free standard shipping. For orders below $35, a flat delivery fee of $4.99 applies.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Dispatch Times</h3>
          <p>
            Orders are dispatched within 24 hours of payment verification on business days. Real-time carrier tracking is provided via our Track Order system.
          </p>
        </div>
      </div>
    </div>
  </div>
);

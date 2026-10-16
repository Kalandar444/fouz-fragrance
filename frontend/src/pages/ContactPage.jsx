import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import { useSettings } from '../context/SettingsContext';
import { submitContact } from '../api/client';

export default function ContactPage() {
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const phone = settings.phone || '+971 54 4540097';
  const whatsapp = settings.whatsapp || '971544540097';
  const email = settings.email || 'fouzfragrance02@gmail.com';
  const address = settings.address || 'Gold souk, Dubai, United Arab Emirates';
  const instagram = settings.instagram_url || 'https://www.instagram.com/fouzfragrance.ae?xtok=MTJ1cGozNDJnYmxzOQ==';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContact(formData);
      setSuccessMessage(res.data?.message || 'Thank you! Your enquiry has been received.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to send enquiry. Please try again or reach us via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-luxury font-semibold text-gold-700">
            Gold Souk, Dubai
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal font-light mt-1 mb-3">
            Contact Fouz Fragrance
          </h1>
          <p className="text-sm text-stone-500 font-light leading-relaxed">
            Have questions about an exclusive extrait, scent recommendation, or bespoke delivery across the UAE? Our fragrance consultants are at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-[#FAF9F7] border border-stone-100 rounded p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-2xl text-charcoal font-medium">
                  {settings.business_name}
                </h3>
                <p className="text-xs uppercase tracking-widest text-gold-700 font-semibold mt-1">
                  {settings.tagline}
                </p>
              </div>

              <div className="space-y-5 text-sm text-stone-600">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal font-medium text-xs uppercase tracking-wider mb-0.5">
                      Boutique Address
                    </strong>
                    <span className="leading-relaxed">{address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal font-medium text-xs uppercase tracking-wider mb-0.5">
                      Telephone
                    </strong>
                    <a href={`tel:${cleanPhone}`} className="text-charcoal hover:text-gold-700 font-semibold">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <MessageCircle className="w-5 h-5 text-[#25D366] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal font-medium text-xs uppercase tracking-wider mb-0.5">
                      WhatsApp Direct
                    </strong>
                    <a
                      href={`https://wa.me/${whatsapp}?text=Hello%20Fouz%20Fragrance`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] hover:underline font-semibold"
                    >
                      +971 54 4540097
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Mail className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal font-medium text-xs uppercase tracking-wider mb-0.5">
                      Email Inquiries
                    </strong>
                    <a href={`mailto:${email}`} className="text-charcoal hover:text-gold-700 break-all font-semibold">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal font-medium text-xs uppercase tracking-wider mb-0.5">
                      Boutique Hours
                    </strong>
                    <span>Saturday – Thursday: 10:00 AM – 10:00 PM</span><br />
                    <span>Friday: 4:30 PM – 10:30 PM (GST)</span>
                  </div>
                </div>

                {instagram && (
                  <div className="flex items-start gap-3.5">
                    <InstagramIcon className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-charcoal font-medium text-xs uppercase tracking-wider mb-0.5">
                        Instagram
                      </strong>
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 font-semibold text-xs inline-flex items-center gap-1"
                      >
                        @fouzfragrance.ae &rarr;
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-stone-200">
              <a
                href={`https://wa.me/${whatsapp}?text=Hello%20Fouz%20Fragrance`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#25D366] text-white hover:bg-[#20ba59] text-xs uppercase tracking-wider font-semibold rounded shadow transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Start WhatsApp Conversation</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded p-8 sm:p-10">
            <h2 className="font-serif text-2xl text-charcoal font-light mb-2">
              Send an Enquiry
            </h2>
            <p className="text-xs text-stone-500 mb-6 font-light">
              We respond promptly to all bespoke order requests, scent consultations, and delivery queries.
            </p>

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                    Your Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Fatima Al Hashemi"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-charcoal focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                    Your Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. fatima@example.ae"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-charcoal focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +971 50 123 4567"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-charcoal focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                    Subject <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. Inquiring about Rosanostra Extrait"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-charcoal focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1">
                  Your Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="How can our fragrance specialists assist you today?"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-charcoal focus:outline-none focus:border-gold-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-charcoal text-white hover:bg-gold-600 disabled:bg-stone-300 text-xs uppercase tracking-luxury font-semibold rounded shadow transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Transmitting...' : 'Send Message to Fouz Fragrance'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

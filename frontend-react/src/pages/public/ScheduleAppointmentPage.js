import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../../services/api';
import { validatePhoneWithCountry, getSupportedCountries } from '../../utils/validation';

const ScheduleAppointmentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country_code: 'US',
    visa_category: '',
    timezone: '',
    preferred_date: '',
    preferred_time: '',
    consultation_type: 'video',
    details: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountryCodeChange = (countryCode) => {
    setFormData(prev => ({
      ...prev,
      country_code: countryCode,
      phone: '' // Clear phone when country changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      const response = await appointmentsAPI.submit(formData);
      
      if (response.success) {
        // Redirect to success page with account creation info
        const queryParams = new URLSearchParams({
          type: 'appointment',
          email: formData.email
        });
        navigate(`/form-success?${queryParams.toString()}`);
      } else {
        setSubmitError(response.error?.message || 'Failed to submit appointment request. Please try again.');
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      
      <div className="pt-28 pb-20 bg-gradient-to-br from-green-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Schedule Your Consultation
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Book a personalized consultation with our immigration experts to discuss your case and explore your options.
            </p>
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <select
                      value={formData.country_code}
                      onChange={(e) => handleCountryCodeChange(e.target.value)}
                      className={`px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        getSupportedCountries().find(c => c.code === formData.country_code) ? 'border-gray-300' : 'border-red-500 bg-red-50'
                      }`}
                      style={{ minWidth: '140px' }}
                    >
                      {getSupportedCountries().map(country => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.dialCode}
                        </option>
                      ))}
                    </select>
                    
                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      minLength={getSupportedCountries().find(c => c.code === formData.country_code)?.minDigits || 10}
                      maxLength={getSupportedCountries().find(c => c.code === formData.country_code)?.maxDigits || 10}
                      placeholder="Enter phone number"
                      className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        formData.phone && formData.phone.replace(/\D/g, '').length > 0 && 
                        (formData.phone.replace(/\D/g, '').length < (getSupportedCountries().find(c => c.code === formData.country_code)?.minDigits || 10) ||
                         formData.phone.replace(/\D/g, '').length > (getSupportedCountries().find(c => c.code === formData.country_code)?.maxDigits || 10))
                        ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div className="mt-1 flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      Selected: {getSupportedCountries().find(c => c.code === formData.country_code)?.flag} {getSupportedCountries().find(c => c.code === formData.country_code)?.name} ({getSupportedCountries().find(c => c.code === formData.country_code)?.dialCode})
                    </span>
                    <span className={`${
                      formData.phone && formData.phone.replace(/\D/g, '').length > 0 && 
                      (formData.phone.replace(/\D/g, '').length < (getSupportedCountries().find(c => c.code === formData.country_code)?.minDigits || 10) ||
                       formData.phone.replace(/\D/g, '').length > (getSupportedCountries().find(c => c.code === formData.country_code)?.maxDigits || 10))
                      ? 'text-red-500 font-semibold' : 'text-gray-500'
                    }`}>
                      {formData.phone.replace(/\D/g, '').length}/{getSupportedCountries().find(c => c.code === formData.country_code)?.maxDigits || 10} digits
                    </span>
                  </div>
                  {!formData.phone && (
                    <div className="mt-1 text-xs text-gray-400">
                      Example: {getSupportedCountries().find(c => c.code === formData.country_code)?.example || '(555) 123-4567'}
                    </div>
                  )}
                  {formData.phone && formData.phone.replace(/\D/g, '').length > 0 && 
                   (formData.phone.replace(/\D/g, '').length < (getSupportedCountries().find(c => c.code === formData.country_code)?.minDigits || 10) ||
                    formData.phone.replace(/\D/g, '').length > (getSupportedCountries().find(c => c.code === formData.country_code)?.maxDigits || 10)) && (
                    <div className="validation-error mt-2 text-red-600 text-sm flex items-center">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      Please enter exactly {getSupportedCountries().find(c => c.code === formData.country_code)?.maxDigits || 10} digits for {getSupportedCountries().find(c => c.code === formData.country_code)?.name}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Visa Category *
                  </label>
                  <select
                    name="visa_category"
                    value={formData.visa_category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select category</option>
                    <option value="eb1a">EB-1A (Extraordinary Ability)</option>
                    <option value="eb2-niw">EB-2 NIW (National Interest Waiver)</option>
                    <option value="o1">O-1 Visa</option>
                    <option value="profile-building">Profile Building</option>
                    <option value="other">Other / Not Sure</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferred_date"
                    value={formData.preferred_date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Preferred Time *
                  </label>
                  <select
                    name="preferred_time"
                    value={formData.preferred_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Tell us about your background and goals *
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Please describe your professional background, achievements, and immigration goals..."
                ></textarea>
              </div>

              <div className="mt-8 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calendar-check mr-2"></i>
                      Schedule Consultation
                    </>
                  )}
                </button>
              </div>

              {submitMessage && (
                <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <i className="fas fa-check-circle mr-2"></i>
                  {submitMessage}
                </div>
              )}
              
              {submitError && (
                <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {submitError}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ScheduleAppointmentPage;
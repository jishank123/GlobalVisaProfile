import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileAssessmentsAPI } from '../../services/api';

const ProfileAssessmentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    field_of_expertise: '',
    years_of_experience: '',
    current_location: '',
    // EB-1A Criteria (0-3 scale)
    original_contributions: 0,
    published_material: 0,
    judging_others_work: 0,
    scholarly_articles: 0,
    leading_role: 0,
    high_salary: 0,
    exhibitions_showcases: 0,
    membership_associations: 0,
    awards_recognition: 0,
    commercial_success: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [assessmentResult, setAssessmentResult] = useState(null);

  const criteriaLabels = {
    original_contributions: 'Original Contributions',
    published_material: 'Published Material About You',
    judging_others_work: 'Judging Others\' Work',
    scholarly_articles: 'Scholarly Articles',
    leading_role: 'Leading Role in Organizations',
    high_salary: 'High Salary/Remuneration',
    exhibitions_showcases: 'Exhibitions/Showcases',
    membership_associations: 'Membership in Associations',
    awards_recognition: 'Awards & Recognition',
    commercial_success: 'Commercial Success'
  };

  const criteriaDescriptions = {
    original_contributions: 'Have you made original scientific, scholarly, artistic, athletic, or business-related contributions of major significance?',
    published_material: 'Has material been published about you in professional publications, major trade publications, or major media?',
    judging_others_work: 'Have you judged the work of others in your field as a panel member or reviewer?',
    scholarly_articles: 'Have you authored scholarly articles in professional journals or major media?',
    leading_role: 'Have you performed in a leading or critical role for organizations with a distinguished reputation?',
    high_salary: 'Do you command a high salary or significantly high remuneration compared to others in your field?',
    exhibitions_showcases: 'Have your works been displayed at artistic exhibitions or showcases?',
    membership_associations: 'Are you a member of associations that require outstanding achievements for membership?',
    awards_recognition: 'Have you received nationally or internationally recognized prizes or awards for excellence?',
    commercial_success: 'Have you achieved commercial success in the performing arts (box office, record sales, etc.)?'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCriteriaChange = (criteria, value) => {
    setFormData(prev => ({
      ...prev,
      [criteria]: parseInt(value)
    }));
  };

  const calculateScore = () => {
    const criteriaKeys = Object.keys(criteriaLabels);
    const totalScore = criteriaKeys.reduce((sum, key) => sum + formData[key], 0);
    const maxScore = criteriaKeys.length * 3;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    let strength = 'Weak';
    let recommendation = 'Significant profile building required';
    let color = 'text-red-600';
    
    if (percentage >= 80) {
      strength = 'Excellent';
      recommendation = 'Strong EB-1A candidate';
      color = 'text-green-600';
    } else if (percentage >= 60) {
      strength = 'Good';
      recommendation = 'Good EB-1A potential with some improvements';
      color = 'text-blue-600';
    } else if (percentage >= 40) {
      strength = 'Fair';
      recommendation = 'Moderate profile building needed';
      color = 'text-yellow-600';
    }
    
    return {
      totalScore,
      maxScore,
      percentage,
      strength,
      recommendation,
      color,
      criteriaCount: criteriaKeys.filter(key => formData[key] >= 2).length
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      const result = calculateScore();
      
      const submissionData = {
        ...formData,
        overall_score: result.totalScore,
        profile_strength: result.strength.toLowerCase(),
        criteria_met: result.criteriaCount
      };

      const response = await profileAssessmentsAPI.submit(submissionData);
      
      if (response.success) {
        // Redirect to success page with account creation info
        const queryParams = new URLSearchParams({
          type: 'profile_assessment',
          email: formData.client_email
        });
        navigate(`/form-success?${queryParams.toString()}`);
      } else {
        setSubmitError(response.error?.message || 'Failed to submit assessment. Please try again.');
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while submitting your assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCriteriaInput = (criteriaKey) => {
    return (
      <div key={criteriaKey} className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">
          {criteriaLabels[criteriaKey]}
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          {criteriaDescriptions[criteriaKey]}
        </p>
        <div className="flex space-x-4">
          {[0, 1, 2, 3].map(value => (
            <label key={value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={criteriaKey}
                value={value}
                checked={formData[criteriaKey] === value}
                onChange={(e) => handleCriteriaChange(criteriaKey, e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">
                {value === 0 && 'No (0)'}
                {value === 1 && 'Weak (1)'}
                {value === 2 && 'Good (2)'}
                {value === 3 && 'Strong (3)'}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      
      <div className="pt-28 pb-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Free EB-1A Profile Assessment
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Evaluate your current profile strength for EB-1A extraordinary ability petition. 
              Get personalized recommendations to improve your chances of success.
            </p>
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  <i className="fas fa-user text-primary mr-3"></i>
                  Personal Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
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
                      name="client_email"
                      value={formData.client_email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="client_phone"
                      value={formData.client_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Current Location *
                    </label>
                    <input
                      type="text"
                      name="current_location"
                      value={formData.current_location}
                      onChange={handleInputChange}
                      required
                      placeholder="City, Country"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Field of Expertise *
                    </label>
                    <input
                      type="text"
                      name="field_of_expertise"
                      value={formData.field_of_expertise}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Artificial Intelligence, Biotechnology"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Years of Experience *
                    </label>
                    <select
                      name="years_of_experience"
                      value={formData.years_of_experience}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select experience</option>
                      <option value="0-2">0-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="11-15">11-15 years</option>
                      <option value="16+">16+ years</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* EB-1A Criteria Assessment */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  <i className="fas fa-trophy text-primary mr-3"></i>
                  EB-1A Criteria Assessment
                </h2>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    <i className="fas fa-info-circle mr-2"></i>
                    Rate each criterion based on your current achievements. You need to demonstrate excellence in at least 3 out of 10 criteria for EB-1A eligibility.
                  </p>
                </div>

                {Object.keys(criteriaLabels).map(renderCriteriaInput)}
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Analyzing Your Profile...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-chart-line mr-2"></i>
                      Get My Assessment Results
                    </>
                  )}
                </button>
              </div>

              {/* Messages */}
              {submitMessage && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <i className="fas fa-check-circle mr-2"></i>
                  {submitMessage}
                </div>
              )}
              
              {submitError && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {submitError}
                </div>
              )}
            </form>

            {/* Assessment Results */}
            {assessmentResult && (
              <div id="assessment-results" className="mt-12 bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  <i className="fas fa-chart-bar text-primary mr-3"></i>
                  Your Assessment Results
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className={`text-4xl font-bold ${assessmentResult.color} mb-2`}>
                      {assessmentResult.percentage}%
                    </div>
                    <div className="text-gray-600">Overall Score</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className={`text-4xl font-bold ${assessmentResult.color} mb-2`}>
                      {assessmentResult.criteriaCount}/10
                    </div>
                    <div className="text-gray-600">Strong Criteria</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${assessmentResult.color} mb-2`}>
                      {assessmentResult.strength}
                    </div>
                    <div className="text-gray-600">Profile Strength</div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-lg mb-6">
                  <h3 className="font-bold text-blue-900 mb-2">Recommendation:</h3>
                  <p className="text-blue-800">{assessmentResult.recommendation}</p>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    Ready to take the next step in your immigration journey?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      to="/schedule" 
                      className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-all"
                    >
                      <i className="fas fa-calendar mr-2"></i>
                      Schedule Expert Consultation
                    </Link>
                    <Link 
                      to="/profile-building" 
                      className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Learn About Profile Building
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileAssessmentPage;
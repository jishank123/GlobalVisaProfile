import jsPDF from 'jspdf';

// Service interest mapping
const serviceMapping = {
  'eb1a-eligibility': 'EB-1A Eligibility',
  'profile-building': 'Profile Building',
  'eb2-niw': 'EB-2 NIW',
  'o1-visa': 'O-1 Visa',
  'career-coaching': 'Career Coaching',
  'other': 'General Immigration'
};

// Criteria labels mapping
const criteriaLabels = {
  criterion_1_awards: 'Awards & Prizes',
  criterion_2_memberships: 'Membership in Associations',
  criterion_3_media: 'Published Material About You',
  criterion_4_judging: 'Judging the Work of Others',
  criterion_5_contributions: 'Original Contributions',
  criterion_6_publications: 'Scholarly Articles',
  criterion_7_exhibitions: 'Exhibitions or Showcases',
  criterion_8_leadership: 'Leading or Critical Role',
  criterion_9_salary: 'High Salary or Remuneration',
  criterion_10_commercial: 'Commercial Success'
};

const getScoreLabel = (score) => {
  if (score === 3) return 'Strong';
  if (score === 2) return 'Moderate';
  if (score === 1) return 'Weak';
  return 'None';
};

const getStrengthColor = (strength) => {
  const strengthLower = strength.toLowerCase();
  if (strengthLower === 'excellent') return [34, 197, 94]; // green
  if (strengthLower === 'good') return [59, 130, 246]; // blue
  if (strengthLower === 'fair') return [234, 179, 8]; // yellow
  return [239, 68, 68]; // red
};

export const generateAssessmentPDF = (assessment) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Get service title from mapping
  const serviceTitle = serviceMapping[assessment.service_interest] || 'Immigration Profile';

  // Header with gradient effect (simulated with rectangles)
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Title - Dynamic based on service interest
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${serviceTitle} Profile Assessment Report`, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Immigration Profile Assessment', pageWidth / 2, 30, { align: 'center' });

  yPos = 50;

  // Client Information Section - Compact two-column layout
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Client Information', 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Left column
  doc.text(`Name: ${assessment.client_name}`, 20, yPos);
  doc.text(`Email: ${assessment.client_email}`, 20, yPos + 5);
  if (assessment.client_phone) {
    doc.text(`Phone: ${assessment.client_phone}`, 20, yPos + 10);
  }
  
  // Right column
  const rightColX = pageWidth / 2 + 10;
  doc.text(`Field: ${assessment.field_of_expertise}`, rightColX, yPos);
  doc.text(`Experience: ${assessment.years_of_experience} years`, rightColX, yPos + 5);
  doc.text(`Location: ${assessment.current_location}`, rightColX, yPos + 10);
  
  yPos += 20;

  // Overall Score Section - Compact
  doc.setFillColor(249, 250, 251);
  doc.rect(15, yPos - 3, pageWidth - 30, 28, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Overall Assessment Score', 20, yPos + 3);
  
  // Calculate percentage correctly
  const percentage = assessment.overall_score;
  
  // Calculate raw score from criteria
  const criteriaKeys = Object.keys(criteriaLabels);
  const totalScore = criteriaKeys.reduce((sum, key) => sum + (assessment[key] || 0), 0);
  const maxScore = 30;
  
  const strengthColor = getStrengthColor(assessment.profile_strength);
  
  // Right side - Score display
  doc.setFontSize(28);
  doc.setTextColor(...strengthColor);
  doc.text(`${percentage}%`, pageWidth - 45, yPos + 10, { align: 'right' });
  
  // Profile strength text
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const strengthText = assessment.profile_strength.toUpperCase();
  const strengthLines = doc.splitTextToSize(strengthText, 45);
  let strengthY = yPos + 16;
  strengthLines.forEach(line => {
    doc.text(line, pageWidth - 45, strengthY, { align: 'right' });
    strengthY += 4;
  });
  
  // Left side - Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Raw Score: ${totalScore} / ${maxScore}`, 20, yPos + 10);
  doc.text(`Criteria Met: ${assessment.criteria_met} / 10`, 20, yPos + 15);
  doc.text(`Strong: ${assessment.strong_criteria_count || 0} | Moderate: ${assessment.moderate_criteria_count || 0}`, 20, yPos + 20);
  
  yPos += 33;

  // Criteria Breakdown - TWO COLUMN LAYOUT
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Criteria Breakdown', 20, yPos);
  yPos += 8;

  // Define column widths
  const leftColStart = 15;
  const leftColWidth = (pageWidth - 30) / 2 - 2;
  const rightColStart = leftColStart + leftColWidth + 4;
  const rightColWidth = leftColWidth;
  
  // Split criteria into two columns
  const criteriaArray = Object.keys(criteriaLabels);
  const leftColumnCriteria = criteriaArray.slice(0, 5);
  const rightColumnCriteria = criteriaArray.slice(5, 10);
  
  // Function to render a criterion row
  const renderCriterion = (key, index, xStart, colWidth, yPosition) => {
    const score = assessment[key] || 0;
    const bgColor = index % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
    
    doc.setFillColor(...bgColor);
    doc.rect(xStart, yPosition - 4, colWidth, 10, 'F');
    
    // Criterion name
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const criterionText = `${index + 1}. ${criteriaLabels[key]}`;
    const wrappedText = doc.splitTextToSize(criterionText, colWidth - 25);
    doc.text(wrappedText[0], xStart + 2, yPosition);
    
    // Score with color
    const scoreColor = score >= 2 ? [34, 197, 94] : score === 1 ? [234, 179, 8] : [156, 163, 175];
    doc.setTextColor(...scoreColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${score}/3`, xStart + colWidth - 15, yPosition, { align: 'right' });
    
    return yPosition + 10;
  };
  
  // Render left column
  let leftY = yPos;
  leftColumnCriteria.forEach((key, index) => {
    leftY = renderCriterion(key, index, leftColStart, leftColWidth, leftY);
  });
  
  // Render right column
  let rightY = yPos;
  rightColumnCriteria.forEach((key, index) => {
    rightY = renderCriterion(key, index + 5, rightColStart, rightColWidth, rightY);
  });
  
  yPos = Math.max(leftY, rightY) + 5;

  // Recommendations Section - Compact
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Key Recommendations', 20, yPos);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const recommendations = getRecommendations(assessment);
  // Limit to top 5 recommendations for space
  const topRecommendations = recommendations.slice(0, 5);
  
  topRecommendations.forEach(rec => {
    const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - 40);
    lines.forEach(line => {
      if (yPos > pageHeight - 25) {
        return; // Stop if running out of space
      }
      doc.text(line, 20, yPos);
      yPos += 4;
    });
    yPos += 1;
  });

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text('This assessment is for informational purposes only and does not constitute legal advice.', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`© Immigration Profile - Assessment Date: ${new Date(assessment.createdAt).toLocaleDateString()}`, pageWidth / 2, footerY + 4, { align: 'center' });

  // Save the PDF
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `Assessment_Report_${dateStr}.pdf`;
  doc.save(fileName);
};

const getRecommendations = (assessment) => {
  const recommendations = [];
  // Use the overall_score directly as it's already a percentage (0-100)
  const percentage = assessment.overall_score;
  
  if (percentage >= 80) {
    recommendations.push('Your profile shows excellent strength for EB-1A petition. Consider proceeding with the application process.');
    recommendations.push('Document all achievements with strong evidence (letters, publications, awards, etc.).');
  } else if (percentage >= 60) {
    recommendations.push('Your profile shows good potential. Focus on strengthening weaker criteria.');
    recommendations.push('Consider obtaining additional evidence for criteria where you scored 1 or 0.');
  } else if (percentage >= 40) {
    recommendations.push('Moderate profile building is needed. Focus on developing 3-4 strong criteria.');
    recommendations.push('Consider strategic career moves to strengthen your profile over the next 6-12 months.');
  } else {
    recommendations.push('Significant profile building is required before applying for EB-1A.');
    recommendations.push('Focus on building achievements in your field over the next 1-2 years.');
  }
  
  // Specific recommendations based on weak criteria
  Object.keys(criteriaLabels).forEach(key => {
    const score = assessment[key] || 0;
    if (score === 0) {
      recommendations.push(`Work on: ${criteriaLabels[key]} - This criterion needs development.`);
    }
  });
  
  recommendations.push('Consult with an immigration attorney to discuss your specific case and timeline.');
  
  return recommendations;
};

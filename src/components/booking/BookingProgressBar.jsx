import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { STEP_LABELS } from '../../utils/bookingHelpers';

const BookingProgressBar = ({ currentStep, onStepClick }) => {
  return (
    <div className="booking-progress-container">
      {STEP_LABELS.map((label, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        
        const stepClasses = [
          'booking-progress-step',
          isCompleted ? 'completed' : '',
          isActive ? 'active' : '',
          isCompleted ? 'clickable' : ''
        ].filter(Boolean).join(' ');

        return (
          <React.Fragment key={idx}>
            <div 
              className={stepClasses} 
              onClick={() => isCompleted && onStepClick && onStepClick(idx)}
              style={isCompleted ? { cursor: 'pointer' } : {}}
            >
              <motion.div 
                className="booking-progress-circle"
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
              </motion.div>
              <span className="booking-progress-label">{label}</span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div className={`booking-progress-line ${isCompleted ? 'filled' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BookingProgressBar;

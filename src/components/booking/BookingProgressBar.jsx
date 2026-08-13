import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const DEFAULT_STEPS = ['القسم', 'الخدمة', 'التفاصيل', 'بياناتك', 'تم'];

const BookingProgressBar = ({
  currentStep = 0,
  steps = DEFAULT_STEPS,
  onStepClick
}) => {
  return (
    <nav className="booking-progress-container" aria-label="خطوات الحجز" dir="rtl">
      {steps.map((label, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isClickable = isCompleted && typeof onStepClick === 'function';

        return (
          <React.Fragment key={idx}>
            <div
              className={`booking-progress-step ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && onStepClick(idx)}
              role={isClickable ? 'button' : 'group'}
              tabIndex={isClickable ? 0 : -1}
              onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onStepClick(idx);
                }
              }}
            >
              <div className="booking-progress-circle">
                {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <span className="booking-progress-label">{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`booking-progress-line ${idx < currentStep ? 'filled' : ''}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BookingProgressBar;

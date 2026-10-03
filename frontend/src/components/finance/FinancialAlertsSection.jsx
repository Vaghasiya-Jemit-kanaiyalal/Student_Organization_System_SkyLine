import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AlertCircle, AlertTriangle, Info, ArrowRight, X } from 'lucide-react';

export const FinancialAlertsSection = ({ onTriggerAlertAction }) => {
  const { alerts, dismissAlert } = useFinance();

  if (!alerts || alerts.length === 0) return null;

  const getAlertStyles = (type) => {
    switch (type) {
      case 'urgent':
        return {
          card: 'bg-primary/5 border-primary/20',
          icon: <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />,
          title: 'text-primary',
          button: 'bg-primary hover:bg-primary-hover text-white'
        };
      case 'warning':
        return {
          card: 'bg-amber-50/80 border-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />,
          title: 'text-amber-900',
          button: 'bg-amber-700 hover:bg-amber-800 text-white'
        };
      default:
        return {
          card: 'bg-blue-50/80 border-blue-200',
          icon: <Info className="w-4 h-4 text-blue-700 flex-shrink-0" />,
          title: 'text-blue-900',
          button: 'bg-blue-700 hover:bg-blue-800 text-white'
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-accent" />
          <span>Financial Attention & Audit Alerts</span>
        </h3>
        <span className="text-[11px] text-text-muted">{alerts.length} action items</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alerts.map((alt) => {
          const style = getAlertStyles(alt.type);
          return (
            <div
              key={alt.id}
              className={`p-4 rounded-xl border ${style.card} shadow-xs flex flex-col justify-between space-y-3 relative group transition`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {style.icon}
                    <h4 className={`text-xs font-bold ${style.title}`}>
                      {alt.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => dismissAlert(alt.id)}
                    className="text-text-muted hover:text-text-primary p-0.5 rounded transition"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed pl-6">
                  {alt.description}
                </p>
              </div>

              <div className="pl-6 pt-1">
                <button
                  onClick={() => onTriggerAlertAction(alt.actionTab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 ${style.button}`}
                >
                  <span>{alt.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

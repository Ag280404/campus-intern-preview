
import React from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface HandbookLinkProps {
  label?: string;
  iconOnly?: boolean;
  className?: string;
}

const HandbookLink: React.FC<HandbookLinkProps> = ({ 
  label = "Know more", 
  iconOnly = false,
  className = ""
}) => {
  const handbookUrl = "https://drive.google.com/file/d/1I2hOz-OHrvTKDwdp561Zgb_CfA2R7NB2/view?usp=sharing";
  
  return (
    <a
      href={handbookUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-slate-400 hover:text-swiggy-orange transition-all duration-300 group/hb ${className}`}
      title={label}
    >
      {iconOnly ? (
        <div className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors">
          <Info size={16} strokeWidth={2.5} />
        </div>
      ) : (
        <>
          <HelpCircle size={14} strokeWidth={2.5} className="group-hover/hb:rotate-12 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest leading-none">{label}</span>
        </>
      )}
    </a>
  );
};

export default HandbookLink;

import React from "react";

type StepBarProps = { currentStep: number };

const StepBar: React.FC<StepBarProps> = ({ currentStep }) => {
  return (
    <div className="flex gap-2 mb-4 w-25">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full  transition-colors duration-300 ${
            i <= currentStep ? "bg-[#6500AC]" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default StepBar;

"use client";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import React from "react";
import { TourPopover } from "../app/components/TourPopover";

interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: string;
    align?: string;
  };
}

export const useTourGuide = () => {
  const [tourCompleted, setTourCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [onCompleteCallback, setOnCompleteCallback] = useState<
    (() => void) | null
  >(null);

  useEffect(() => {
    const completed = sessionStorage.getItem("tourCompleted");
    setTourCompleted(completed === "true");
  }, []);

  const startTour = (tourSteps: TourStep[], onComplete?: () => void) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
    setOnCompleteCallback(() => onComplete);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsActive(false);
    sessionStorage.setItem("tourCompleted", "true");
    setTourCompleted(true);
    if (onCompleteCallback) onCompleteCallback();
  };

  const getElementPosition = (selector: string, side?: string) => {
    const element = document.querySelector(selector);
    if (!element) return { top: 100, left: 100 };

    const rect = element.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;
    const popoverWidth = isMobile ? window.innerWidth * 0.9 : 400;
    const spacing = isMobile ? 10 : 15;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    // Position based on side
    switch (side) {
      case "left":
        left = rect.left - popoverWidth - spacing;
        top = rect.top + rect.height / 2 - 150;
        if (left < 20) {
          left = rect.right + spacing;
        }
        break;
      case "right":
        left = rect.right + spacing;
        top = rect.top + rect.height / 2 - 150;
        if (left + popoverWidth > viewportWidth - 20) {
          left = rect.left - popoverWidth - spacing;
        }
        break;
      case "top":
        top = rect.top - 320;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
        if (top < 20) {
          top = rect.bottom + spacing;
        }
        break;
      case "bottom":
      default:
        top = rect.bottom + spacing;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
        if (top + 350 > viewportHeight) {
          top = rect.top - 320;
        }
        break;
    }

    // Final viewport bounds check
    const margin = isMobile ? 10 : 20;
    if (left < margin) left = margin;
    if (left + popoverWidth > viewportWidth - margin) {
      left = viewportWidth - popoverWidth - margin;
    }
    if (top < margin) top = margin;
    const popoverHeight = isMobile ? 280 : 350;
    if (top + popoverHeight > viewportHeight) {
      top = viewportHeight - popoverHeight - margin;
    }

    return { top, left };
  };

  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const currentStepData = steps[currentStep];
    const element = document.querySelector(currentStepData.element);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("tour-highlight");
    }

    return () => {
      if (element) {
        element.classList.remove("tour-highlight");
      }
    };
  }, [currentStep, isActive, steps]);

  const TourOverlay = () => {
    if (!isActive || steps.length === 0) return null;

    const currentStepData = steps[currentStep];
    const position = getElementPosition(
      currentStepData.element,
      currentStepData.popover.side
    );

    return ReactDOM.createPortal(
      React.createElement(
        React.Fragment,
        null,
        React.createElement("div", {
          className: "fixed inset-0 bg-black/70 backdrop-blur-lg z-[9998]",
          onClick: handleClose,
        }),
        React.createElement(TourPopover, {
          title: currentStepData.popover.title,
          description: currentStepData.popover.description,
          currentStep: currentStep + 1,
          totalSteps: steps.length,
          onNext: handleNext,
          onPrevious: handlePrevious,
          onClose: handleClose,
          position: position,
        })
      ),
      document.body
    );
  };

  const resetTour = () => {
    sessionStorage.removeItem("tourCompleted");
    setTourCompleted(false);
  };

  return { tourCompleted, startTour, resetTour, TourOverlay };
};

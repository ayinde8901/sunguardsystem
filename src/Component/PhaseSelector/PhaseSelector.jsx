
import React from 'react';
import './PhaseSelector.css';

import {
  FaSolarPanel,
  FaVideo,
  FaLayerGroup,
  FaTools,
  FaCheckCircle
} from 'react-icons/fa';

function PhaseSelector({
  selectedProjectType,
  setSelectedProjectType
}) {
  const projectTypes = [
    {
      id: 'solar',
      title: 'Solar Installation',
      description: 'Solar panels, inverters, batteries and accessories.',
      icon: <FaSolarPanel />
    },
    {
      id: 'cctv',
      title: 'CCTV Installation',
      description: 'Cameras, DVRs, NVRs, storage and security equipment.',
      icon: <FaVideo />
    },
    {
      id: 'solar-cctv',
      title: 'Solar + CCTV',
      description: 'Combine solar power and CCTV in one project.',
      icon: <FaLayerGroup />
    },
    {
      id: 'other',
      title: 'Other Projects',
      description: 'Enter materials and services for other projects.',
      icon: <FaTools />
    }
  ];

  return (
    <section className="phase-selector-section">

      <div className="phase-selector-heading">
        <div>
          <span className="phase-step">STEP 02</span>
          <h2>Select Project Type</h2>
          <p>
            Choose the type of project you are preparing
            this quotation for.
          </p>
        </div>
      </div>

      <div className="phase-options">

        {projectTypes.map((project) => {
          const isSelected =
            selectedProjectType === project.id;

          return (
            <button
              type="button"
              key={project.id}
              className={`phase-option ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedProjectType(project.id)}
              aria-pressed={isSelected}
            >

              <div className="phase-option-top">

                <div className="phase-icon">
                  {project.icon}
                </div>

                {isSelected && (
                  <FaCheckCircle className="phase-check" />
                )}

              </div>

              <h3>{project.title}</h3>

              <p>{project.description}</p>

            </button>
          );
        })}

      </div>

      {selectedProjectType && (
        <div className="phase-selection-message">
          <FaCheckCircle />
          <p>
            {projectTypes.find(
              (project) => project.id === selectedProjectType
            )?.title} selected for this quotation.
          </p>
        </div>
      )}

    </section>
  );
}

export default PhaseSelector;

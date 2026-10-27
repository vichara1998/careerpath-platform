import { ArrowRight, BookOpen, Compass, Sparkles, Check } from "lucide-react";
import { qualificationLabels } from "./qualificationRules.js";

export default function PathwayPreview({ form }) {
  const qualifications = (form.qualificationLevel || "").split(",").filter(Boolean);
  const interests = (form.interests || "").split(",").map(value => value.trim()).filter(Boolean);
  const milestones = [
    { title: "Your starting point", complete: qualifications.length > 0,
      detail: qualifications.length ? `${qualificationLabels[qualifications[0]] || qualifications[0]}${qualifications.length > 1 ? ` +${qualifications.length - 1}` : ""}` : "Every background has a next step" },
    { title: "Your interests", complete: interests.length > 0 || !!form.stream,
      detail: interests.length ? interests.slice(0, 2).join(" / ") : form.stream ? "A direction is taking shape" : "Discover what sparks your curiosity" },
    { title: "Your next chapter", complete: !!form.careerGoal,
      detail: form.careerGoal ? form.careerGoal.split(",")[0] : "Make room for new possibilities" },
  ];
  const completed = milestones.filter(step => step.complete).length;
  return <div className="pathway-preview">
    <div className="pathway-preview-hero">
      <div className="pathway-preview-badge">A PATH THAT FITS YOU</div>
      <h2>Big possibilities.<br /><em>A clearer next step.</em></h2>
      <p className="pathway-preview-intro">You bring the ambition. Let's connect your background to a direction worth exploring.</p>
      <div className="pathway-map" aria-label="Your pathway preview">
        <svg className="pathway-map-lines" viewBox="0 0 600 250" preserveAspectRatio="none" aria-hidden="true">
          <path className="pathway-map-glow" d="M45 205 C190 205 130 130 285 130 S390 48 555 48" />
          <path className="pathway-map-track" d="M45 205 C190 205 130 130 285 130 S390 48 555 48" />
          <circle cx="45" cy="205" r="5" /><circle cx="285" cy="130" r="5" /><circle cx="555" cy="48" r="5" />
        </svg>
        {milestones.map((step, index) => <div className={`pathway-map-stop pathway-map-stop-${index + 1}${step.complete ? " is-complete" : ""}`} key={step.title}>
          <span className="pathway-map-number">{step.complete ? <Check size={13} /> : `0${index + 1}`}</span>
          <div><span className="pathway-map-label">{step.title}</span><strong>{step.detail}</strong></div>
        </div>)}
        <span className="pathway-map-star" aria-hidden="true"><Sparkles size={23} /></span>
      </div>
      <div className="pathway-preview-progress">
        <span>{completed ? "Your profile is taking shape" : "Small details. More relevant choices."}</span>
        <div className="pathway-preview-bars" role="img" aria-label={`${completed} of 3 profile areas added`}>
          {milestones.map(step => <i key={step.title} className={step.complete ? "is-complete" : ""} />)}
        </div>
      </div>
    </div>
    <div className="pathway-preview-bottom">
      <p className="eyebrow">WHAT'S WAITING FOR YOU</p>
      <div className="pathway-preview-benefits">
        <div><span className="pathway-benefit-icon"><BookOpen size={19} /></span><div><h3>Courses that fit</h3><p>Explore your interests with entry routes suited to your education.</p></div></div>
        <div><span className="pathway-benefit-icon"><Compass size={19} /></span><div><h3>More ways forward</h3><p>Discover suitable options in other fields, too.</p></div></div>
      </div>
      <p className="pathway-preview-note"><Sparkles size={16} /><span>Add your details, then choose <strong>Build my pathway</strong>.</span><ArrowRight size={17} /></p>
    </div>
  </div>;
}

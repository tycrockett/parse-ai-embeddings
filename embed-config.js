module.exports.propertyChains = {
  "Details.PlanType": {
    embed: "insurance plan type",
  },
  ProviderName: {
    embed: "carrier or provider",
  },
  "Details.InNetworkProfessionalServices.UrgentCare": {
    embed: "urgent care",
  },
  "Details.InNetworkProfessionalServices.MentalHealthOutpatient": {
    embed: "mental health",
  },
  "Details.InNetworkProfessionalServices.PreventativeCare": {
    embed: "preventative care",
  },
  "Details.InNetworkProfessionalServices.InPatientHospital": {
    embed: "in patient hospital",
  },
  "Details.InNetworkProfessionalServices.Baby": {
    embed: "baby service",
  },
  "Details.InNetworkProfessionalServices.VirtualPrimary": {
    embed: "virtual primary",
  },
  "Details.InNetworkProfessionalServices.PrimaryCarePhysician": {
    embed: "primary care physician",
  },
  "Details.InNetworkPlanDesign.Coinsurance": {
    embed: "in network coinsurance",
  },
  "Details.InNetworkPrescriptionDrugs.PrescriptionDrugTier": {
    embed: "rx tier count",
  },
  "Details.InNetworkPrescriptionDrugs.Tier1": {
    embed: "rx tier 1",
  },
  "Details.InNetworkPrescriptionDrugs.Tier2": {
    embed: "rx tier 2",
  },
  "Details.InNetworkPrescriptionDrugs.Tier3": {
    embed: "rx tier 3",
  },
  "Details.InNetworkPrescriptionDrugs.Tier4": {
    embed: "rx tier 4",
  },
  "Details.InNetworkPrescriptionDrugs.Tier5": {
    embed: "rx tier 5",
  },
  "Details.InNetworkPrescriptionDrugs.Tier6": {
    embed: "rx tier 6",
  },
};

module.exports.propertyValues = {
  _CostOrCoverage: {
    embed: "Does this text describe a cost value",
  },
  "Details.PlanType": {
    embed: "Does the text include 'hmo' or 'ppo' or 'epo' or 'hdhp'?",
    filter: (value) => {
      const upperValue = value?.toUpperCase();
      if (upperValue.includes("HMO")) return "HMO";
      if (upperValue.includes("PPO")) return "PPO";
      if (upperValue.includes("EPO")) return "EPO";
      if (upperValue.includes("HDHP")) return "HDHP";
      return "-";
    },
  },
  ProviderName: {
    embed: "insurance carrier or provider",
    filter: (value) => {
      const upperValue = value?.toUpperCase();
      if (upperValue.includes("NAME")) return "-";
      return value;
    },
  },
  "Details.InNetworkProfessionalServices.UrgentCare": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkProfessionalServices.MentalHealthOutpatient": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkProfessionalServices.PreventativeCare": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkProfessionalServices.InPatientHospital": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkProfessionalServices.Baby": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkProfessionalServices.VirtualPrimary": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkProfessionalServices.PrimaryCarePhysician": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkPlanDesign.Coinsurance": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkPrescriptionDrugs.PrescriptionDrugTier": {
    embed:
      "Does this text describe the total number of prescription drug tiers (e.g. “3 tiers”, “four tiers”)?",
  },
  "Details.InNetworkPrescriptionDrugs.Tier1": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkPrescriptionDrugs.Tier2": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkPrescriptionDrugs.Tier3": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkPrescriptionDrugs.Tier4": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkPrescriptionDrugs.Tier5": {
    defer: "_CostOrCoverage",
  },
  "Details.InNetworkPrescriptionDrugs.Tier6": {
    defer: "_CostOrCoverage",
  },
};

module.exports.utilities = {
  inNetwork: {
    embed: "In Network",
  },
  outOfNetwork: {
    embed: "Out of Network",
  },
  renewal: {
    embed:
      "Label for items representing the renewal of an existing plan or policy",
  },
  current: {
    embed:
      "Label for items representing a plan or policy that is active and in effect",
  },
};

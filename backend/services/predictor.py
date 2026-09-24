import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from schemas.prediction import (
    WaterParametersInput,
    PredictionResponse,
    EngineeredFeatures,
    ParameterAnalysisItem,
    FeatureImportanceItem,
    ParameterDefinitionItem,
    PresetItem,
    ParametersMetadataResponse
)

# Feature metadata matching model training
FEATURE_COLUMNS = [
    "Temperature", "DO", "pH", "Conductivity", "BOD", "Nitrate",
    "Fecal_Coliform", "DO_BOD_ratio", "Pollution_Index", "pH_deviation",
    "Conductivity_log", "Rule_Label_Feature"
]

FEATURE_METADATA = {
    "DO": {"label": "Dissolved Oxygen (DO)", "desc": "Crucial for aerobic aquatic life and organic decomposition balance."},
    "Rule_Label_Feature": {"label": "CPCB Rule Prior", "desc": "Regulatory prior knowledge injected into the tree ensemble."},
    "DO_BOD_ratio": {"label": "DO / BOD Ratio", "desc": "Balances oxygen supply versus biochemical decomposition demand."},
    "BOD": {"label": "Biochemical Oxygen Demand", "desc": "Indicator of organic pollutant loading from sewage and runoff."},
    "Conductivity_log": {"label": "Log(Conductivity)", "desc": "Dampens extreme ionic concentration fluctuations in high-salinity waters."},
    "Fecal_Coliform": {"label": "Fecal Coliform Count", "desc": "Bacterial pathogen indicator originating from untreated wastewater."},
    "Pollution_Index": {"label": "Composite Pollution Index", "desc": "Engineered aggregate of BOD, Nitrate, and micro-pathogen load."},
    "Conductivity": {"label": "Electrical Conductivity", "desc": "Total dissolved ions, minerals, and inorganic salt concentrations."},
    "Nitrate": {"label": "Nitrate (NO3)", "desc": "Nutrient concentration indicator driving eutrophication and algal blooms."},
    "Temperature": {"label": "Water Temperature", "desc": "Controls metabolic rates, solubility of gases, and chemical kinetics."},
    "pH_deviation": {"label": "pH Neutrality Deviation", "desc": "Magnitude of departure from neutral pH 7.0 baseline."},
    "pH": {"label": "pH Acidity/Basicity", "desc": "Acid-base balance regulating chemical toxicity and enzyme function."}
}

CLASS_INFO = {
    4: {
        "code": "Class A",
        "name": "Class A — Drinking Water Source",
        "description": "Drinking water source without conventional treatment but after disinfection",
        "status": "excellent",
        "banner": "EXCELLENT WATER QUALITY"
    },
    3: {
        "code": "Class B",
        "name": "Class B — Outdoor Bathing",
        "description": "Safe for organized outdoor bathing and contact recreation",
        "status": "good",
        "banner": "GOOD WATER QUALITY"
    },
    2: {
        "code": "Class C",
        "name": "Class C — Treatment Required",
        "description": "Drinking water source after conventional treatment and disinfection",
        "status": "moderate",
        "banner": "MODERATE WATER QUALITY"
    },
    1: {
        "code": "Class D",
        "name": "Class D — Fisheries & Wildlife",
        "description": "Propagation of wildlife and fisheries, commercial fish culture",
        "status": "poor",
        "banner": "POOR WATER QUALITY"
    },
    0: {
        "code": "Class E",
        "name": "Class E — Irrigation & Industrial",
        "description": "Irrigation, industrial cooling, and controlled waste disposal",
        "status": "poor",
        "banner": "VERY POOR WATER QUALITY"
    }
}

PARAMETER_DEFINITIONS: List[ParameterDefinitionItem] = [
    ParameterDefinitionItem(
        key="temperature",
        name="Temperature",
        unit="°C",
        min_value=0.0,
        max_value=45.0,
        step=0.1,
        default_value=25.0,
        good_range=[15.0, 30.0],
        regulatory_threshold="Ambient seasonal temperature (15–30 °C)",
        guidance="Regulates gas solubility, microbial metabolism, and chemical equilibrium kinetics.",
        scientific_role="Thermal kinetics & biological respiration limit"
    ),
    ParameterDefinitionItem(
        key="do",
        name="Dissolved Oxygen",
        unit="mg/L",
        min_value=0.0,
        max_value=14.0,
        step=0.1,
        default_value=7.0,
        good_range=[6.0, 14.0],
        regulatory_threshold="≥ 6.0 mg/L (Class A), ≥ 5.0 mg/L (Class B), ≥ 4.0 mg/L (Class C/D)",
        guidance="Vital for fish respiration; hypoxia occurs below 4.0 mg/L, threatening aquatic ecosystems.",
        scientific_role="Primary respiratory and aerobic oxidation health metric"
    ),
    ParameterDefinitionItem(
        key="ph",
        name="pH",
        unit="",
        min_value=0.0,
        max_value=14.0,
        step=0.1,
        default_value=7.2,
        good_range=[6.5, 8.5],
        regulatory_threshold="6.5 – 8.5 (Classes A, B, C; max 6.0–9.0)",
        guidance="Measures hydrogen ion activity; values outside 6.5–8.5 disrupt fish mucus and metal solubility.",
        scientific_role="Chemical neutrality and ionic equilibrium indicator"
    ),
    ParameterDefinitionItem(
        key="conductivity",
        name="Electrical Conductivity",
        unit="µS/cm",
        min_value=0.0,
        max_value=3000.0,
        step=10.0,
        default_value=500.0,
        good_range=[0.0, 1000.0],
        regulatory_threshold="≤ 1000 µS/cm (Freshwater baseline; ≤ 2250 µS/cm for irrigation)",
        guidance="Total dissolved ionic solids and mineral salt content from weathering or runoff.",
        scientific_role="Total dissolved solids (TDS) and mineral electrolyte density"
    ),
    ParameterDefinitionItem(
        key="bod",
        name="Biochemical Oxygen Demand",
        unit="mg/L",
        min_value=0.0,
        max_value=30.0,
        step=0.1,
        default_value=2.4,
        good_range=[0.0, 3.0],
        regulatory_threshold="≤ 2.0 mg/L (Class A), ≤ 3.0 mg/L (Classes B & C)",
        guidance="Oxygen consumed by microorganisms decomposing organic waste; high BOD indicates sewage load.",
        scientific_role="Organic biodegradable pollutant loading metric"
    ),
    ParameterDefinitionItem(
        key="nitrate",
        name="Nitrate (NO3)",
        unit="mg/L",
        min_value=0.0,
        max_value=50.0,
        step=0.1,
        default_value=1.2,
        good_range=[0.0, 10.0],
        regulatory_threshold="≤ 20.0 mg/L (Safe), ≤ 45.0 mg/L (CPCB/WHO potable limit)",
        guidance="Nutrient enrichment indicator from agricultural fertilizer runoff and wastewater.",
        scientific_role="Eutrophication driver and potable toxicity parameter"
    ),
    ParameterDefinitionItem(
        key="fecal_coliform",
        name="Fecal Coliform",
        unit="CFU/100mL",
        min_value=0.0,
        max_value=20000.0,
        step=10.0,
        default_value=120.0,
        good_range=[0.0, 500.0],
        regulatory_threshold="≤ 50 CFU/100mL (Class A), ≤ 500 (Class B), ≤ 5000 (Class C)",
        guidance="Microbial pathogen density indicating municipal sewage or animal fecal contamination.",
        scientific_role="Microbiological enteric pathogen risk indicator"
    )
]

PRESETS: List[PresetItem] = [
    PresetItem(
        id="class_a",
        label="Pristine Headwater (Class A)",
        description="Drinking source without conventional treatment; high oxygen, minimal organic pollutants",
        category="class_preset",
        values=WaterParametersInput(temperature=21.0, do=8.2, ph=7.3, conductivity=180.0, bod=1.1, nitrate=0.8, fecal_coliform=20.0)
    ),
    PresetItem(
        id="class_b",
        label="Clean Bathing Reach (Class B)",
        description="Safe for organized outdoor bathing and contact recreation; compliant with CPCB standards",
        category="class_preset",
        values=WaterParametersInput(temperature=25.0, do=6.8, ph=7.4, conductivity=450.0, bod=2.5, nitrate=1.8, fecal_coliform=160.0)
    ),
    PresetItem(
        id="class_c",
        label="Agricultural Runoff (Class C)",
        description="Moderate nutrient and bacterial loading; requires conventional treatment before drinking",
        category="class_preset",
        values=WaterParametersInput(temperature=27.0, do=4.8, ph=6.9, conductivity=850.0, bod=3.2, nitrate=8.5, fecal_coliform=1400.0)
    ),
    PresetItem(
        id="class_de",
        label="Severely Polluted Reach (Class D/E)",
        description="Low dissolved oxygen, elevated BOD and untreated sewage bacteria",
        category="class_preset",
        values=WaterParametersInput(temperature=31.0, do=2.4, ph=6.2, conductivity=1750.0, bod=12.0, nitrate=16.5, fecal_coliform=12000.0)
    ),
    PresetItem(
        id="ganga_upstream",
        label="Ganga at Varanasi Upstream",
        description="Upper reach baseline with moderate domestic influence",
        category="river_station",
        values=WaterParametersInput(temperature=24.5, do=7.6, ph=7.8, conductivity=380.0, bod=2.1, nitrate=1.4, fecal_coliform=240.0)
    ),
    PresetItem(
        id="yamuna_delhi",
        label="Yamuna at Delhi (Nizamuddin)",
        description="Heavy urban discharge corridor with severe biochemical stress",
        category="river_station",
        values=WaterParametersInput(temperature=28.2, do=1.2, ph=7.1, conductivity=1420.0, bod=18.4, nitrate=14.2, fecal_coliform=16500.0)
    ),
    PresetItem(
        id="sabarmati_ahmedabad",
        label="Sabarmati at Ahmedabad Downstream",
        description="Downstream urban confluence with treated effluent and industrial runoff",
        category="river_station",
        values=WaterParametersInput(temperature=29.0, do=2.1, ph=7.5, conductivity=1850.0, bod=14.5, nitrate=9.8, fecal_coliform=9800.0)
    ),
    PresetItem(
        id="narmada_hoshangabad",
        label="Narmada at Hoshangabad",
        description="Clean central Indian river stretch with elevated dissolved oxygen",
        category="river_station",
        values=WaterParametersInput(temperature=23.0, do=8.1, ph=7.7, conductivity=260.0, bod=1.5, nitrate=0.9, fecal_coliform=45.0)
    ),
    PresetItem(
        id="godavari_nashik",
        label="Godavari at Nashik",
        description="Upper Godavari basin reach with balanced dissolved solids",
        category="river_station",
        values=WaterParametersInput(temperature=25.4, do=6.4, ph=7.6, conductivity=520.0, bod=2.9, nitrate=2.4, fecal_coliform=380.0)
    ),
    PresetItem(
        id="krishna_vijayawada",
        label="Krishna at Vijayawada",
        description="Downstream delta agricultural and municipal monitoring station",
        category="river_station",
        values=WaterParametersInput(temperature=26.8, do=6.9, ph=7.9, conductivity=480.0, bod=2.2, nitrate=1.6, fecal_coliform=210.0)
    )
]


class PredictorService:
    def __init__(self, model_path: str, scaler_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler file not found at {scaler_path}")

        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.feature_importances = self._compute_feature_importances()

    def _compute_feature_importances(self) -> List[FeatureImportanceItem]:
        raw_importances = self.model.feature_importances_
        items = []
        for i, name in enumerate(FEATURE_COLUMNS):
            imp = float(raw_importances[i])
            meta = FEATURE_METADATA.get(name, {"label": name, "desc": "Predictive feature"})
            items.append({
                "feature": name,
                "label": meta["label"],
                "importance": imp,
                "percentage": imp * 100.0,
                "description": meta["desc"]
            })
        items.sort(key=lambda x: x["importance"], reverse=True)
        return [
            FeatureImportanceItem(
                feature=item["feature"],
                label=item["label"],
                importance=round(item["importance"], 4),
                percentage=round(item["percentage"], 2),
                rank=idx + 1,
                description=item["description"]
            )
            for idx, item in enumerate(items)
        ]

    def get_parameters_metadata(self) -> ParametersMetadataResponse:
        cpcb_classes_dict = {
            str(k): {
                "code": v["code"],
                "name": v["name"],
                "description": v["description"],
                "status": v["status"],
                "banner": v["banner"]
            }
            for k, v in CLASS_INFO.items()
        }
        return ParametersMetadataResponse(
            parameters=PARAMETER_DEFINITIONS,
            presets=PRESETS,
            cpcb_classes=cpcb_classes_dict,
            disclaimer="Methodology Notice: CPCB classifications reflect statutory Central Pollution Control Board "
                       "water-use criteria. Machine Learning classifications are probabilistic predictions from a trained "
                       "Random Forest ensemble and serve as an analytical decision-support tool."
        )

    @staticmethod
    def cpcb_rule(do: float, bod: float, fc: float, ph: float) -> int:
        """Official CPCB Rule-Based Water Quality Classification"""
        if do >= 6.0 and bod <= 2.0 and fc <= 50.0 and 6.5 <= ph <= 8.5:
            return 4
        elif do >= 5.0 and bod <= 3.0 and fc <= 500.0 and 6.5 <= ph <= 8.5:
            return 3
        elif do >= 4.0 and bod <= 3.0 and fc <= 5000.0 and 6.0 <= ph <= 9.0:
            return 2
        elif do >= 4.0:
            return 1
        else:
            return 0

    @staticmethod
    def get_limiting_factor(p: WaterParametersInput, rule_score: int) -> str:
        """Determines the limiting parameter(s) restricting higher CPCB water quality classification."""
        if rule_score == 4:
            return "Meets all statutory CPCB criteria for Class A (Drinking water source without conventional treatment)."
        if rule_score == 3:
            reasons = []
            if p.do < 6.0:
                reasons.append(f"DO is {p.do:.1f} mg/L (< 6.0 required)")
            if p.bod > 2.0:
                reasons.append(f"BOD is {p.bod:.1f} mg/L (> 2.0 required)")
            if p.fecal_coliform > 50:
                reasons.append(f"Fecal Coliform is {p.fecal_coliform:.0f} CFU/100mL (> 50 required)")
            return f"Restricted from Class A: {', '.join(reasons)}."
        if rule_score == 2:
            reasons = []
            if p.do < 5.0:
                reasons.append(f"DO is {p.do:.1f} mg/L (< 5.0 required)")
            if p.fecal_coliform > 500:
                reasons.append(f"Fecal Coliform is {p.fecal_coliform:.0f} CFU/100mL (> 500 required)")
            return f"Restricted from Class B (Outdoor Bathing): {', '.join(reasons)}."
        if rule_score == 1:
            reasons = []
            if p.bod > 3.0:
                reasons.append(f"BOD is {p.bod:.1f} mg/L (> 3.0 required)")
            if p.fecal_coliform > 5000:
                reasons.append(f"Fecal Coliform is {p.fecal_coliform:.0f} CFU/100mL (> 5,000 required)")
            return f"Restricted from Class C (Drinking with Treatment): {', '.join(reasons)}."
        return f"Restricted to Class E: Dissolved Oxygen ({p.do:.1f} mg/L) is below the 4.0 mg/L minimum statutory threshold required for aquatic life (Class D)."

    @staticmethod
    def calculate_parameter_breakdown(p: WaterParametersInput) -> Tuple[List[ParameterAnalysisItem], float]:
        """Calculates transparent sub-scores and scientific explanations for each parameter."""
        items = []
        scores = {}

        # 1. Dissolved Oxygen (DO) mg/L
        if p.do >= 6.5:
            do_status, do_score = "Excellent", 98.0
            do_exp = "Abundant dissolved oxygen supports diverse fish species and healthy aquatic ecosystems."
        elif p.do >= 5.0:
            do_status, do_score = "Good", 85.0
            do_exp = "Healthy dissolved oxygen levels generally support aquatic life and meet bathing norms."
        elif p.do >= 4.0:
            do_status, do_score = "Moderate", 65.0
            do_exp = "Marginal dissolved oxygen sufficient for resilient fish species; stress may occur."
        elif p.do >= 2.0:
            do_status, do_score = "Warning", 35.0
            do_exp = "Hypoxic conditions detected; biological oxygen consumption exceeds replenishment."
        else:
            do_status, do_score = "Critical", 10.0
            do_exp = "Severely depleted oxygen. High mortality risk for aquatic organisms and septic odor danger."

        items.append(ParameterAnalysisItem(
            name="Dissolved Oxygen",
            key="do",
            value=p.do,
            unit="mg/L",
            status=do_status,
            recommended_range="≥ 6.0 mg/L (Class A), ≥ 5.0 mg/L (Class B)",
            explanation=do_exp,
            score=do_score
        ))
        scores["do"] = do_score

        # 2. pH Level
        if 6.8 <= p.ph <= 7.8:
            ph_status, ph_score = "Excellent", 96.0
            ph_exp = "pH is near optimal neutrality (6.8–7.8), ensuring ideal chemical equilibrium."
        elif 6.5 <= p.ph <= 8.5:
            ph_status, ph_score = "Good", 85.0
            ph_exp = "pH is within standard CPCB regulatory limits for drinking and bathing."
        elif 6.0 <= p.ph < 6.5 or 8.5 < p.ph <= 9.0:
            ph_status, ph_score = "Moderate", 60.0
            ph_exp = "pH shows minor deviation from ideal range; may affect skin sensitivity and metal solubility."
        elif 5.0 <= p.ph < 6.0 or 9.0 < p.ph <= 10.0:
            ph_status, ph_score = "Warning", 30.0
            ph_exp = "Significant acidic or alkaline shift; corrosive or caustic risks to biological tissues."
        else:
            ph_status, ph_score = "Critical", 5.0
            ph_exp = "Extreme pH level outside biological survival boundaries; severe industrial contamination indicator."

        items.append(ParameterAnalysisItem(
            name="pH Level",
            key="ph",
            value=p.ph,
            unit="",
            status=ph_status,
            recommended_range="6.5 – 8.5 (Drinking/Bathing)",
            explanation=ph_exp,
            score=ph_score
        ))
        scores["ph"] = ph_score

        # 3. Biochemical Oxygen Demand (BOD) mg/L
        if p.bod <= 1.5:
            bod_status, bod_score = "Excellent", 98.0
            bod_exp = "Very low BOD indicates minimal organic pollution and exceptionally clean river water."
        elif p.bod <= 2.0:
            bod_status, bod_score = "Good", 90.0
            bod_exp = "Low BOD meets CPCB Class A drinking source standards without treatment."
        elif p.bod <= 3.0:
            bod_status, bod_score = "Moderate", 75.0
            bod_exp = "Moderate BOD acceptable for outdoor bathing; requires filtration before potable use."
        elif p.bod <= 6.0:
            bod_status, bod_score = "Warning", 45.0
            bod_exp = "Elevated BOD indicates untreated domestic sewage or organic effluent discharge."
        else:
            bod_status, bod_score = "Critical", 15.0
            bod_exp = "Severe organic pollution load; rapid microbial breakdown depletes dissolved oxygen."

        items.append(ParameterAnalysisItem(
            name="Biochemical Oxygen Demand",
            key="bod",
            value=p.bod,
            unit="mg/L",
            status=bod_status,
            recommended_range="≤ 2.0 mg/L (Class A), ≤ 3.0 mg/L (Class B)",
            explanation=bod_exp,
            score=bod_score
        ))
        scores["bod"] = bod_score

        # 4. Conductivity µS/cm
        if p.conductivity <= 300:
            cond_status, cond_score = "Excellent", 95.0
            cond_exp = "Low mineral content and dissolved solids; characteristic of pristine river headwaters."
        elif p.conductivity <= 800:
            cond_status, cond_score = "Good", 85.0
            cond_exp = "Normal conductivity for freshwater river systems with standard mineral background."
        elif p.conductivity <= 1500:
            cond_status, cond_score = "Moderate", 65.0
            cond_exp = "Elevated dissolved solids; acceptable for irrigation and secondary contact recreation."
        elif p.conductivity <= 3000:
            cond_status, cond_score = "Warning", 40.0
            cond_exp = "High salinity or agricultural runoff containing dissolved fertilizers and mineral salts."
        else:
            cond_status, cond_score = "Critical", 15.0
            cond_exp = "Very high ionic conductance; potential industrial brines or seawater intrusion."

        items.append(ParameterAnalysisItem(
            name="Electrical Conductivity",
            key="conductivity",
            value=p.conductivity,
            unit="µS/cm",
            status=cond_status,
            recommended_range="≤ 750 – 1000 µS/cm (Freshwater)",
            explanation=cond_exp,
            score=cond_score
        ))
        scores["conductivity"] = cond_score

        # 5. Nitrate (NO3) mg/L
        if p.nitrate <= 1.0:
            nit_status, nit_score = "Excellent", 98.0
            nit_exp = "Minimal nitrate levels indicate negligible agricultural fertilizer or wastewater runoff."
        elif p.nitrate <= 5.0:
            nit_status, nit_score = "Good", 88.0
            nit_exp = "Well below CPCB and WHO maximum allowable limit for drinking water sources (45 mg/L)."
        elif p.nitrate <= 15.0:
            nit_status, nit_score = "Moderate", 70.0
            nit_exp = "Moderate nutrient enrichment; monitors recommended to prevent localized eutrophication."
        elif p.nitrate <= 45.0:
            nit_status, nit_score = "Warning", 45.0
            nit_exp = "Approaching maximum regulatory limit; risk of algal growth and methemoglobinemia risk if untreated."
        else:
            nit_status, nit_score = "Critical", 10.0
            nit_exp = "Exceeds 45 mg/L threshold; hazardous for infant consumption and triggers toxic algal blooms."

        items.append(ParameterAnalysisItem(
            name="Nitrate (NO3)",
            key="nitrate",
            value=p.nitrate,
            unit="mg/L",
            status=nit_status,
            recommended_range="≤ 20 mg/L (Safe), ≤ 45 mg/L (Regulatory Max)",
            explanation=nit_exp,
            score=nit_score
        ))
        scores["nitrate"] = nit_score

        # 6. Fecal Coliform CFU/100mL
        if p.fecal_coliform <= 50:
            fc_status, fc_score = "Excellent", 98.0
            fc_exp = "Meets Class A drinking water source standard without conventional treatment."
        elif p.fecal_coliform <= 500:
            fc_status, fc_score = "Good", 85.0
            fc_exp = "Within CPCB Class B outdoor bathing criteria (≤ 500 MPN/100ml)."
        elif p.fecal_coliform <= 2500:
            fc_status, fc_score = "Moderate", 60.0
            fc_exp = "Treatment required before drinking; secondary contact recreation still feasible."
        elif p.fecal_coliform <= 5000:
            fc_status, fc_score = "Warning", 35.0
            fc_exp = "Substantial biological contamination; direct water contact not recommended."
        else:
            fc_status, fc_score = "Critical", 10.0
            fc_exp = "High sewage contamination; severe gastrointestinal pathogen hazard."

        items.append(ParameterAnalysisItem(
            name="Fecal Coliform",
            key="fecal_coliform",
            value=p.fecal_coliform,
            unit="CFU/100mL",
            status=fc_status,
            recommended_range="≤ 50 (Class A), ≤ 500 (Class B), ≤ 5000 (Class C)",
            explanation=fc_exp,
            score=fc_score
        ))
        scores["fc"] = fc_score

        # 7. Temperature °C
        if 18.0 <= p.temperature <= 28.0:
            t_status, t_score = "Excellent", 95.0
            t_exp = "Temperature is in the optimal range for temperate to tropical freshwater biology."
        elif 15.0 <= p.temperature <= 32.0:
            t_status, t_score = "Good", 85.0
            t_exp = "Normal seasonal fluctuation for Indian river basins."
        elif 10.0 <= p.temperature < 15.0 or 32.0 < p.temperature <= 38.0:
            t_status, t_score = "Moderate", 65.0
            t_exp = "Warm water reduces oxygen solubility and accelerates microbial metabolism."
        elif 38.0 < p.temperature <= 45.0:
            t_status, t_score = "Warning", 40.0
            t_exp = "Thermal discharge detected; adverse impact on indigenous aquatic flora and fauna."
        else:
            t_status, t_score = "Critical", 15.0
            t_exp = "Extreme thermal anomaly outside natural river ecosystem tolerance."

        items.append(ParameterAnalysisItem(
            name="Water Temperature",
            key="temperature",
            value=p.temperature,
            unit="°C",
            status=t_status,
            recommended_range="18 – 30 °C (Ambient Seasonal)",
            explanation=t_exp,
            score=t_score
        ))
        scores["temperature"] = t_score

        # Weighted aggregate for Calculated Water Quality Indicator (WQI)
        # Weights: DO: 0.28, BOD: 0.22, FC: 0.20, pH: 0.12, Nitrate: 0.08, Conductivity: 0.06, Temp: 0.04
        wqi = (
            scores["do"] * 0.28 +
            scores["bod"] * 0.22 +
            scores["fc"] * 0.20 +
            scores["ph"] * 0.12 +
            scores["nitrate"] * 0.08 +
            scores["conductivity"] * 0.06 +
            scores["temperature"] * 0.04
        )
        wqi = round(min(100.0, max(0.0, wqi)), 1)
        return items, wqi

    @staticmethod
    def generate_automated_insights(p: WaterParametersInput, ml_score: int, rule_score: int) -> Tuple[List[str], List[str]]:
        insights = []
        warnings = []

        # Positive insights
        if p.do >= 6.0:
            insights.append("✓ Dissolved oxygen (DO) is within the preferred range for healthy aquatic ecology.")
        elif p.do >= 5.0:
            insights.append("✓ Dissolved oxygen satisfies standard CPCB Class B bathing requirements.")

        if 6.5 <= p.ph <= 8.5:
            insights.append("✓ Water pH is well within the acceptable regulatory limits (6.5 – 8.5).")

        if p.bod <= 2.0:
            insights.append("✓ Low BOD confirms minimal biodegradable organic contamination.")

        if p.nitrate <= 10.0:
            insights.append("✓ Nitrate concentrations are safe and prevent eutrophication risk.")

        if p.fecal_coliform <= 50:
            insights.append("✓ Fecal coliform density conforms to pristine Class A drinking baseline.")
        elif p.fecal_coliform <= 500:
            insights.append("✓ Fecal coliform is within safe outdoor bathing criteria.")

        # Warnings and alerts
        if p.bod > 3.0:
            warnings.append("⚠ BOD is elevated (> 3.0 mg/L) indicating organic sewage or industrial discharge.")

        if p.do < 4.0:
            warnings.append("⚠ Dissolved oxygen is critically low (< 4.0 mg/L), threatening fish survival.")

        if p.fecal_coliform > 500:
            warnings.append(f"⚠ High fecal coliform count ({p.fecal_coliform:.0f} CFU/100mL) suggests microbial pathogen contamination.")

        if p.ph < 6.5 or p.ph > 8.5:
            warnings.append(f"⚠ pH ({p.ph:.2f}) deviates outside the normal regulatory boundary (6.5 – 8.5).")

        if p.nitrate > 45.0:
            warnings.append(f"⚠ Nitrate level ({p.nitrate:.1f} mg/L) exceeds the WHO potable threshold (45 mg/L).")

        if p.conductivity > 2000.0:
            warnings.append("⚠ High electrical conductivity points to severe mineral or industrial salt runoff.")

        if ml_score != rule_score:
            warnings.append(f"ℹ Multi-parameter divergence: ML classified as {CLASS_INFO[ml_score]['code']} while Rule classified as {CLASS_INFO[rule_score]['code']}.")

        return insights, warnings

    def predict(self, p: WaterParametersInput) -> PredictionResponse:
        # 1. CPCB Rule Evaluation
        rule_score = self.cpcb_rule(p.do, p.bod, p.fecal_coliform, p.ph)
        rule_info = CLASS_INFO[rule_score]

        # 2. Feature Engineering
        do_bod_ratio = p.do / (p.bod + 1.0)
        pollution_index = p.bod + p.nitrate + (p.fecal_coliform * 0.001)
        ph_dev = abs(p.ph - 7.0)
        cond_log = float(np.log1p(p.conductivity))

        engineered = EngineeredFeatures(
            do_bod_ratio=round(do_bod_ratio, 4),
            pollution_index=round(pollution_index, 4),
            ph_deviation=round(ph_dev, 4),
            conductivity_log=round(cond_log, 4),
            rule_label_feature=rule_score
        )

        # 3. Assemble Feature DataFrame in exact trained order
        input_dict = {
            "Temperature": p.temperature,
            "DO": p.do,
            "pH": p.ph,
            "Conductivity": p.conductivity,
            "BOD": p.bod,
            "Nitrate": p.nitrate,
            "Fecal_Coliform": p.fecal_coliform,
            "DO_BOD_ratio": do_bod_ratio,
            "Pollution_Index": pollution_index,
            "pH_deviation": ph_dev,
            "Conductivity_log": cond_log,
            "Rule_Label_Feature": rule_score
        }
        df_input = pd.DataFrame([input_dict], columns=FEATURE_COLUMNS)

        # 4. Standard Scaling & Inference
        scaled_input = self.scaler.transform(df_input)
        ml_score = int(self.model.predict(scaled_input)[0])
        probabilities = self.model.predict_proba(scaled_input)[0]
        confidence = float(np.max(probabilities))

        ml_info = CLASS_INFO[ml_score]

        # Format probabilities dictionary
        prob_dict = {}
        for class_idx in sorted(CLASS_INFO.keys(), reverse=True):
            code = CLASS_INFO[class_idx]["code"]
            if class_idx < len(probabilities):
                prob_dict[code] = round(float(probabilities[class_idx]), 4)
            else:
                prob_dict[code] = 0.0

        # 5. Agreement & Status
        agreement = (ml_score == rule_score)
        if agreement:
            agreement_message = "Consensus Verified: The Machine Learning model agrees with regulatory CPCB standards."
        else:
            agreement_message = (
                f"Model Disagreement: ML classified as {ml_info['code']} while CPCB thresholds yield {rule_info['code']}. "
                "The Random Forest model identified complex non-linear combinations across the 12 features. Further testing advised."
            )

        # 6. Parameter Analysis & WQI
        params_analysis, wqi = self.calculate_parameter_breakdown(p)

        # Determine overall WQI label
        if wqi >= 85:
            indicator_label = "Excellent Quality"
        elif wqi >= 70:
            indicator_label = "Good Quality"
        elif wqi >= 50:
            indicator_label = "Fair Quality"
        elif wqi >= 30:
            indicator_label = "Marginal Quality"
        else:
            indicator_label = "Poor Quality"

        # 7. Insights, Warnings & Limiting Factor
        insights, warnings = self.generate_automated_insights(p, ml_score, rule_score)
        limiting_factor = self.get_limiting_factor(p, rule_score)

        return PredictionResponse(
            cpcb_class=rule_info["name"],
            cpcb_code=rule_info["code"],
            cpcb_score=rule_score,
            ml_class=ml_info["name"],
            ml_code=ml_info["code"],
            ml_score=ml_score,
            confidence=round(confidence, 4),
            confidence_percentage=round(confidence * 100.0, 2),
            probabilities=prob_dict,
            agreement=agreement,
            agreement_message=agreement_message,
            status_banner=ml_info["banner"],
            status_level=ml_info["status"],
            water_quality_indicator=wqi,
            indicator_label=indicator_label,
            limiting_factor=limiting_factor,
            engineered_features=engineered,
            parameters_analysis=params_analysis,
            warnings=warnings,
            insights=insights,
            feature_importance=self.feature_importances
        )

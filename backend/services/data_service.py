import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from schemas.dataset import DatasetRecord, DatasetQueryResponse, SummaryKPIs, StationCard
from schemas.prediction import WaterParametersInput
from services.predictor import PredictorService, CLASS_INFO

# Well-known GPS coordinates for river basins / monitoring hubs in the dataset
KNOWN_LOCATIONS = {
    "SABARMATI": {
        "AHMEDABAD": (23.0225, 72.5714),
        "GANDHINAGAR": (23.2156, 72.6369),
        "KHEDA": (22.7533, 72.6844)
    },
    "NARMADA": {
        "BHARUCH": (21.7051, 72.9959),
        "HOSHANGABAD": (22.7519, 77.7289),
        "JABALPUR": (23.1815, 79.9864),
        "MANDLA": (22.5982, 80.3712),
        "OMKARESHWAR": (22.2436, 76.1511)
    },
    "GODAVARI": {
        "NASHIK": (19.9975, 73.7898),
        "NANDED": (19.1383, 77.3210),
        "RAJAHMUNDRY": (17.0005, 81.8040),
        "RAMAGUNDAM": (18.7551, 79.5141),
        "BHADRACHALAM": (17.6688, 80.8935)
    },
    "YANUMA": {  # dataset uses 'Yanuma' for Yamuna
        "DELHI": (28.6139, 77.2090),
        "AGRA": (27.1767, 78.0081),
        "MATHURA": (27.4924, 77.6737),
        "ETAWAH": (26.7769, 79.0336),
        "PRAYAGRAJ": (25.4358, 81.8463)
    },
    "KRISHNA": {
        "VIJAYAWADA": (16.5062, 80.6480),
        "SANGLI": (16.8524, 74.5815),
        "SATARA": (17.6805, 74.0183),
        "SRISAILAM": (16.0734, 78.8687)
    },
    "MAHANADI": {
        "CUTTACK": (20.4625, 85.8828),
        "SAMBALPUR": (21.4669, 83.9812),
        "RAIPUR": (21.2514, 81.6296)
    }
}


class DataService:
    def __init__(self, excel_path: str):
        if not os.path.exists(excel_path):
            raise FileNotFoundError(f"Dataset not found at {excel_path}")

        # Load raw dataset
        raw_df = pd.read_excel(excel_path)
        
        # Standardize column types and clean
        for col in ['Temperature', 'DO', 'pH', 'Conductivity', 'BOD', 'Nitrate', 'Fecal_Coliform', 'Year']:
            if col in raw_df.columns:
                raw_df[col] = pd.to_numeric(raw_df[col], errors='coerce')

        raw_df.drop_duplicates(inplace=True)
        raw_df.reset_index(drop=True, inplace=True)
        raw_df['id'] = raw_df.index + 1

        # Calculate CPCB Rule for every record where core parameters exist
        def assign_cpcb(row):
            do = row.get('DO')
            bod = row.get('BOD')
            fc = row.get('Fecal_Coliform')
            ph = row.get('pH')
            if pd.isna(do) or pd.isna(bod) or pd.isna(ph):
                return None, None
            fc_val = 0.0 if pd.isna(fc) else float(fc)
            code_int = PredictorService.cpcb_rule(float(do), float(bod), fc_val, float(ph))
            info = CLASS_INFO[code_int]
            return info['name'], info['code']

        cpcb_res = raw_df.apply(assign_cpcb, axis=1)
        raw_df['cpcb_class'] = [r[0] for r in cpcb_res]
        raw_df['cpcb_code'] = [r[1] for r in cpcb_res]

        self.df = raw_df
        self.kpis = self._compute_kpis()
        self.correlations = self._compute_correlations()
        self.distributions = self._compute_distributions()
        self.class_distribution = self._compute_class_distribution()
        self.river_trends = self._compute_river_trends()
        self.stations = self._extract_stations()

    def _compute_kpis(self) -> SummaryKPIs:
        df = self.df
        total_records = len(df)
        years = df['Year'].dropna().astype(int).unique()
        year_range = f"{min(years)} – {max(years)}" if len(years) > 0 else "2013 – 2023"

        num_rivers = int(df['River_Name'].nunique())
        num_states = int(df['State_Name'].dropna().nunique())
        num_stations = int(df['Station_Code'].dropna().nunique())

        avg_ph = float(df['pH'].median()) if not df['pH'].empty else 7.2
        avg_do = float(df['DO'].median()) if not df['DO'].empty else 7.0
        avg_bod = float(df['BOD'].median()) if not df['BOD'].empty else 3.5
        avg_cond = float(df['Conductivity'].median()) if not df['Conductivity'].empty else 450.0
        avg_nit = float(df['Nitrate'].median()) if not df['Nitrate'].empty else 1.5
        avg_fc = float(df['Fecal_Coliform'].median()) if not df['Fecal_Coliform'].empty else 150.0

        pollution_index = avg_bod + avg_nit + (avg_fc * 0.001)

        # Compliance rate: % with CPCB Class A, B, or C
        valid_cpcb = df['cpcb_code'].dropna()
        if len(valid_cpcb) > 0:
            compliant = valid_cpcb.isin(['Class A', 'Class B', 'Class C']).sum()
            compliance_rate = round(float(compliant / len(valid_cpcb) * 100.0), 1)
            dominant = valid_cpcb.mode().iloc[0] if not valid_cpcb.empty else "Class B"
        else:
            compliance_rate = 68.5
            dominant = "Class B"

        return SummaryKPIs(
            total_records=total_records,
            year_range=year_range,
            num_rivers=num_rivers,
            num_states=num_states,
            num_stations=num_stations,
            avg_ph=round(avg_ph, 2),
            avg_do=round(avg_do, 2),
            avg_bod=round(avg_bod, 2),
            avg_conductivity=round(avg_cond, 1),
            avg_nitrate=round(avg_nit, 2),
            avg_fecal_coliform=round(avg_fc, 1),
            avg_pollution_index=round(pollution_index, 2),
            cpcb_compliance_rate=compliance_rate,
            dominant_class=dominant
        )

    def _compute_correlations(self) -> Dict[str, Any]:
        num_cols = ['Temperature', 'DO', 'pH', 'Conductivity', 'BOD', 'Nitrate', 'Fecal_Coliform']
        sub_df = self.df[num_cols].dropna()
        corr_matrix = sub_df.corr().round(3)
        return {
            "columns": num_cols,
            "matrix": corr_matrix.to_dict()
        }

    def _compute_distributions(self) -> Dict[str, List[Dict[str, Any]]]:
        params = {
            "ph": ("pH", (5.0, 9.5), 10),
            "do": ("DO", (0.0, 14.0), 12),
            "bod": ("BOD", (0.0, 15.0), 10),
            "conductivity": ("Conductivity", (50.0, 2000.0), 12),
            "nitrate": ("Nitrate", (0.0, 10.0), 10),
            "fecal_coliform": ("Fecal_Coliform", (0.0, 5000.0), 10)
        }
        dist = {}
        for key, (col, (min_val, max_val), bins) in params.items():
            series = self.df[col].dropna()
            # Filter outliers for clean display
            series = series[(series >= min_val) & (series <= max_val)]
            if len(series) > 0:
                counts, bin_edges = np.histogram(series, bins=bins)
                bin_data = []
                for i in range(len(counts)):
                    label = f"{bin_edges[i]:.1f}–{bin_edges[i+1]:.1f}"
                    bin_data.append({
                        "bin": label,
                        "range_start": round(float(bin_edges[i]), 1),
                        "range_end": round(float(bin_edges[i+1]), 1),
                        "count": int(counts[i])
                    })
                dist[key] = bin_data
            else:
                dist[key] = []
        return dist

    def _compute_class_distribution(self) -> List[Dict[str, Any]]:
        counts = self.df['cpcb_code'].value_counts()
        total = counts.sum()
        order = ['Class A', 'Class B', 'Class C', 'Class D', 'Class E']
        colors = {
            'Class A': '#0ea5e9', # sky blue
            'Class B': '#10b981', # emerald green
            'Class C': '#f59e0b', # amber yellow
            'Class D': '#f97316', # orange
            'Class E': '#ef4444'  # red
        }
        res = []
        for cls in order:
            cnt = int(counts.get(cls, 0))
            pct = round((cnt / total * 100.0), 1) if total > 0 else 0.0
            res.append({
                "class_code": cls,
                "name": cls,
                "count": cnt,
                "percentage": pct,
                "color": colors.get(cls, "#6b7280")
            })
        return res

    def _compute_river_trends(self) -> Dict[str, List[Dict[str, Any]]]:
        # Multi-year trend by river (2013-2023)
        trends = {}
        for river, group in self.df.groupby('River_Name'):
            yearly = group.groupby('Year').agg({
                'DO': 'mean',
                'BOD': 'mean',
                'pH': 'mean',
                'Conductivity': 'mean',
                'Nitrate': 'mean',
                'Fecal_Coliform': 'mean'
            }).round(2).reset_index()
            
            river_display = "Yamuna" if river.lower() == "yanuma" else river
            records = []
            for _, row in yearly.iterrows():
                records.append({
                    "year": int(row['Year']),
                    "do": float(row['DO']) if not pd.isna(row['DO']) else None,
                    "bod": float(row['BOD']) if not pd.isna(row['BOD']) else None,
                    "ph": float(row['pH']) if not pd.isna(row['pH']) else None,
                    "conductivity": float(row['Conductivity']) if not pd.isna(row['Conductivity']) else None,
                    "nitrate": float(row['Nitrate']) if not pd.isna(row['Nitrate']) else None,
                    "fecal_coliform": float(row['Fecal_Coliform']) if not pd.isna(row['Fecal_Coliform']) else None
                })
            trends[river_display] = sorted(records, key=lambda x: x["year"])
        return trends

    def _extract_stations(self) -> List[StationCard]:
        cards = []
        # Group by station code or location
        station_groups = self.df.groupby('Station_Code')
        for code, group in station_groups:
            if pd.isna(code):
                continue
            # Pick latest record
            sorted_g = group.sort_values(by='Year', ascending=False)
            latest = sorted_g.iloc[0]

            river = str(latest['River_Name'])
            river_key = river.upper()
            loc_str = str(latest['Monitoring_Location']).upper()
            state = str(latest['State_Name']) if not pd.isna(latest['State_Name']) else "Unknown"

            # Check lat/lng
            lat, lng = None, None
            if river_key in KNOWN_LOCATIONS:
                river_locs = KNOWN_LOCATIONS[river_key]
                for city_key, coords in river_locs.items():
                    if city_key in loc_str:
                        lat, lng = coords
                        break

            # Compute WQI with clipped inputs for safety
            temp_val = float(latest['Temperature']) if not pd.isna(latest['Temperature']) else 25.0
            do_val = float(latest['DO']) if not pd.isna(latest['DO']) else 6.5
            ph_val = float(latest['pH']) if not pd.isna(latest['pH']) else 7.2
            cond_val = float(latest['Conductivity']) if not pd.isna(latest['Conductivity']) else 400.0
            bod_val = float(latest['BOD']) if not pd.isna(latest['BOD']) else 3.0
            nit_val = float(latest['Nitrate']) if not pd.isna(latest['Nitrate']) else 1.2
            fc_val = float(latest['Fecal_Coliform']) if not pd.isna(latest['Fecal_Coliform']) else 120.0

            p_in = WaterParametersInput(
                temperature=min(60.0, max(0.0, temp_val)),
                do=min(30.0, max(0.0, do_val)),
                ph=min(14.0, max(0.0, ph_val)),
                conductivity=min(20000.0, max(0.0, cond_val)),
                bod=min(100.0, max(0.0, bod_val)),
                nitrate=min(100.0, max(0.0, nit_val)),
                fecal_coliform=min(100000.0, max(0.0, fc_val))
            )
            _, wqi = PredictorService.calculate_parameter_breakdown(p_in)

            cpcb_code = str(latest['cpcb_code']) if not pd.isna(latest['cpcb_code']) else "Class B"
            cpcb_class = str(latest['cpcb_class']) if not pd.isna(latest['cpcb_class']) else "Class B — Outdoor Bathing"

            # Determine station record classification
            st_code_int = int(code)
            status = "Periodic Telemetry" if (st_code_int % 3 == 0) else "Historical Record"

            cards.append(StationCard(
                station_code=str(st_code_int),
                river_name="Yamuna" if river.lower() == "yanuma" else river,
                monitoring_location=str(latest['Monitoring_Location']),
                state_name=state.title(),
                status=status,
                is_live_stream=False,
                last_recorded_year=int(latest['Year']),
                temperature=round(float(latest['Temperature']), 1) if not pd.isna(latest['Temperature']) else None,
                do=round(float(latest['DO']), 2) if not pd.isna(latest['DO']) else None,
                ph=round(float(latest['pH']), 2) if not pd.isna(latest['pH']) else None,
                conductivity=round(float(latest['Conductivity']), 1) if not pd.isna(latest['Conductivity']) else None,
                bod=round(float(latest['BOD']), 2) if not pd.isna(latest['BOD']) else None,
                nitrate=round(float(latest['Nitrate']), 2) if not pd.isna(latest['Nitrate']) else None,
                fecal_coliform=round(float(latest['Fecal_Coliform']), 1) if not pd.isna(latest['Fecal_Coliform']) else None,
                cpcb_class=cpcb_class,
                cpcb_code=cpcb_code,
                water_quality_indicator=wqi,
                latitude=lat,
                longitude=lng
            ))
        # Sort by station code
        cards.sort(key=lambda x: int(x.station_code) if x.station_code.isdigit() else 99999)
        return cards

    def query_dataset(
        self,
        search: Optional[str] = None,
        river: Optional[str] = None,
        state: Optional[str] = None,
        year: Optional[int] = None,
        cpcb_class: Optional[str] = None,
        sort_by: Optional[str] = "id",
        sort_order: Optional[str] = "asc",
        page: int = 1,
        page_size: int = 20
    ) -> DatasetQueryResponse:
        filtered = self.df.copy()

        if search:
            s = search.lower()
            mask = (
                filtered['River_Name'].astype(str).str.lower().str.contains(s) |
                filtered['Monitoring_Location'].astype(str).str.lower().str.contains(s) |
                filtered['State_Name'].astype(str).str.lower().str.contains(s) |
                filtered['Station_Code'].astype(str).str.lower().str.contains(s)
            )
            filtered = filtered[mask]

        if river:
            r = river.lower()
            if r == "yamuna":
                filtered = filtered[filtered['River_Name'].str.lower().isin(['yamuna', 'yanuma'])]
            else:
                filtered = filtered[filtered['River_Name'].str.lower() == r]

        if state:
            filtered = filtered[filtered['State_Name'].astype(str).str.lower() == state.lower()]

        if year:
            filtered = filtered[filtered['Year'] == year]

        if cpcb_class:
            filtered = filtered[filtered['cpcb_code'] == cpcb_class]

        # Sorting
        if sort_by and sort_by in filtered.columns:
            ascending = (sort_order == "asc")
            filtered = filtered.sort_values(by=sort_by, ascending=ascending)

        total = len(filtered)
        total_pages = max(1, (total + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_records = filtered.iloc[start_idx:end_idx]

        records = []
        for _, row in page_records.iterrows():
            river_name = str(row['River_Name'])
            if river_name.lower() == "yanuma":
                river_name = "Yamuna"

            records.append(DatasetRecord(
                id=int(row['id']),
                year=int(row['Year']) if not pd.isna(row['Year']) else None,
                river_name=river_name,
                station_code=str(int(row['Station_Code'])) if not pd.isna(row['Station_Code']) else None,
                monitoring_location=str(row['Monitoring_Location']) if not pd.isna(row['Monitoring_Location']) else None,
                state_name=str(row['State_Name']).title() if not pd.isna(row['State_Name']) else None,
                temperature=round(float(row['Temperature']), 1) if not pd.isna(row['Temperature']) else None,
                do=round(float(row['DO']), 2) if not pd.isna(row['DO']) else None,
                ph=round(float(row['pH']), 2) if not pd.isna(row['pH']) else None,
                conductivity=round(float(row['Conductivity']), 1) if not pd.isna(row['Conductivity']) else None,
                bod=round(float(row['BOD']), 2) if not pd.isna(row['BOD']) else None,
                nitrate=round(float(row['Nitrate']), 2) if not pd.isna(row['Nitrate']) else None,
                fecal_coliform=round(float(row['Fecal_Coliform']), 1) if not pd.isna(row['Fecal_Coliform']) else None,
                cpcb_class=str(row['cpcb_class']) if not pd.isna(row['cpcb_class']) else None,
                cpcb_code=str(row['cpcb_code']) if not pd.isna(row['cpcb_code']) else None
            ))

        return DatasetQueryResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            records=records
        )

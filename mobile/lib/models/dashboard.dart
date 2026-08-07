class Kpi {
  Kpi({
    required this.id,
    required this.label,
    required this.value,
    required this.delta,
    required this.hint,
  });

  final String id;
  final String label;
  final String value;
  final num delta;
  final String hint;

  factory Kpi.fromJson(Map<String, dynamic> j) => Kpi(
        id: j['id'] as String? ?? '',
        label: j['label'] as String? ?? '',
        value: j['value'] as String? ?? '',
        delta: (j['delta'] as num?) ?? 0,
        hint: j['hint'] as String? ?? '',
      );
}

class CashFlowPoint {
  CashFlowPoint({
    required this.month,
    required this.inflow,
    required this.outflow,
  });

  final String month;
  final num inflow;
  final num outflow;

  factory CashFlowPoint.fromJson(Map<String, dynamic> j) => CashFlowPoint(
        month: j['month'] as String? ?? '',
        inflow: (j['inflow'] as num?) ?? 0,
        outflow: (j['outflow'] as num?) ?? 0,
      );
}

class SalesVelocity {
  SalesVelocity({required this.month, required this.units});
  final String month;
  final int units;

  factory SalesVelocity.fromJson(Map<String, dynamic> j) => SalesVelocity(
        month: j['month'] as String? ?? '',
        units: (j['units'] as num?)?.toInt() ?? 0,
      );
}

class AppNotification {
  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.time,
    required this.tone,
  });

  final String id;
  final String title;
  final String body;
  final String time;
  final String tone;

  factory AppNotification.fromJson(Map<String, dynamic> j) => AppNotification(
        id: j['id'] as String? ?? '',
        title: j['title'] as String? ?? '',
        body: j['body'] as String? ?? '',
        time: j['time'] as String? ?? '',
        tone: j['tone'] as String? ?? 'info',
      );
}

class MixSlice {
  MixSlice({required this.label, required this.value, required this.color});
  final String label;
  final int value;
  final String color;

  factory MixSlice.fromJson(Map<String, dynamic> j) => MixSlice(
        label: j['label'] as String? ?? '',
        value: (j['value'] as num?)?.toInt() ?? 0,
        color: j['color'] as String? ?? '#6B7280',
      );
}

class LandSummary {
  LandSummary({
    required this.totalAcres,
    required this.availableParcels,
    required this.avgRatePerAcre,
    required this.titleQueue,
    required this.realised,
    required this.registeredParcels,
  });

  final num totalAcres;
  final num availableParcels;
  final num avgRatePerAcre;
  final num titleQueue;
  final num realised;
  final num registeredParcels;

  factory LandSummary.fromJson(Map<String, dynamic> j) => LandSummary(
        totalAcres: (j['totalAcres'] as num?) ?? 0,
        availableParcels: (j['availableParcels'] as num?) ?? 0,
        avgRatePerAcre: (j['avgRatePerAcre'] as num?) ?? 0,
        titleQueue: (j['titleQueue'] as num?) ?? 0,
        realised: (j['realised'] as num?) ?? 0,
        registeredParcels: (j['registeredParcels'] as num?) ?? 0,
      );
}

class DashboardPayload {
  DashboardPayload({
    required this.kpis,
    required this.landKpis,
    required this.cashFlow,
    required this.salesVelocity,
    required this.notifications,
    required this.unitMix,
    required this.landMix,
    required this.landSummary,
  });

  final List<Kpi> kpis;
  final List<Kpi> landKpis;
  final List<CashFlowPoint> cashFlow;
  final List<SalesVelocity> salesVelocity;
  final List<AppNotification> notifications;
  final List<MixSlice> unitMix;
  final List<MixSlice> landMix;
  final LandSummary landSummary;

  factory DashboardPayload.fromJson(Map<String, dynamic> j) => DashboardPayload(
        kpis: ((j['kpis'] as List?) ?? [])
            .map((e) => Kpi.fromJson(e as Map<String, dynamic>))
            .toList(),
        landKpis: ((j['landKpis'] as List?) ?? [])
            .map((e) => Kpi.fromJson(e as Map<String, dynamic>))
            .toList(),
        cashFlow: ((j['cashFlow'] as List?) ?? [])
            .map((e) => CashFlowPoint.fromJson(e as Map<String, dynamic>))
            .toList(),
        salesVelocity: ((j['salesVelocity'] as List?) ?? [])
            .map((e) => SalesVelocity.fromJson(e as Map<String, dynamic>))
            .toList(),
        notifications: ((j['notifications'] as List?) ?? [])
            .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
            .toList(),
        unitMix: ((j['unitMix'] as List?) ?? [])
            .map((e) => MixSlice.fromJson(e as Map<String, dynamic>))
            .toList(),
        landMix: ((j['landMix'] as List?) ?? [])
            .map((e) => MixSlice.fromJson(e as Map<String, dynamic>))
            .toList(),
        landSummary: LandSummary.fromJson((j['landSummary'] as Map<String, dynamic>?) ?? {}),
      );
}

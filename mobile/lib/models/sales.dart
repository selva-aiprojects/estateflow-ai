class Lead {
  Lead({
    required this.id,
    required this.name,
    required this.phone,
    required this.source,
    required this.project,
    required this.unitType,
    required this.budget,
    required this.score,
    required this.status,
    required this.assigned,
    required this.aiEngaged,
    required this.segment,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String phone;
  final String source;
  final String project;
  final String unitType;
  final num budget;
  final num score;
  final String status;
  final String assigned;
  final bool aiEngaged;
  final String segment;
  final String createdAt;

  factory Lead.fromJson(Map<String, dynamic> j) => Lead(
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        phone: j['phone'] as String? ?? '',
        source: j['source'] as String? ?? 'whatsapp',
        project: j['project'] as String? ?? '',
        unitType: j['unitType'] as String? ?? '',
        budget: (j['budget'] as num?) ?? 0,
        score: (j['score'] as num?) ?? 0,
        status: j['status'] as String? ?? 'new',
        assigned: j['assigned'] as String? ?? '',
        aiEngaged: j['aiEngaged'] as bool? ?? false,
        segment: j['segment'] as String? ?? 'apartments',
        createdAt: j['createdAt'] as String? ?? '',
      );
}

class Unit {
  Unit({
    required this.id,
    required this.no,
    required this.type,
    required this.floor,
    required this.tower,
    required this.sqft,
    required this.price,
    required this.status,
  });

  final String id;
  final String no;
  final String type;
  final int floor;
  final String tower;
  final num sqft;
  final num price;
  final String status;

  factory Unit.fromJson(Map<String, dynamic> j) => Unit(
        id: j['id'] as String? ?? '',
        no: j['no'] as String? ?? '',
        type: j['type'] as String? ?? '',
        floor: (j['floor'] as num?)?.toInt() ?? 0,
        tower: j['tower'] as String? ?? '',
        sqft: (j['sqft'] as num?) ?? 0,
        price: (j['price'] as num?) ?? 0,
        status: j['status'] as String? ?? 'available',
      );
}

class Tower {
  Tower({required this.id, required this.code, required this.name, required this.units});
  final String id;
  final String code;
  final String name;
  final List<Unit> units;

  factory Tower.fromJson(Map<String, dynamic> j) => Tower(
        id: j['id'] as String? ?? '',
        code: j['code'] as String? ?? '',
        name: j['name'] as String? ?? '',
        units: ((j['units'] as List?) ?? [])
            .map((e) => Unit.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class Project {
  Project({
    required this.id,
    required this.code,
    required this.name,
    required this.location,
    required this.reraNo,
    required this.towers,
  });

  final String id;
  final String code;
  final String name;
  final String location;
  final String reraNo;
  final List<Tower> towers;

  factory Project.fromJson(Map<String, dynamic> j) => Project(
        id: j['id'] as String? ?? '',
        code: j['code'] as String? ?? '',
        name: j['name'] as String? ?? '',
        location: j['location'] as String? ?? '',
        reraNo: j['reraNo'] as String? ?? '',
        towers: ((j['towers'] as List?) ?? [])
            .map((e) => Tower.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class StatusMeta {
  StatusMeta({required this.label, required this.color, required this.dot});
  final String label;
  final String color;
  final String dot;

  factory StatusMeta.fromJson(Map<String, dynamic> j) => StatusMeta(
        label: j['label'] as String? ?? '',
        color: j['color'] as String? ?? '#6B7280',
        dot: j['dot'] as String? ?? '#6B7280',
      );
}

class InventoryPayload {
  InventoryPayload({required this.projects, required this.unitStatusMeta});
  final List<Project> projects;
  final Map<String, StatusMeta> unitStatusMeta;

  factory InventoryPayload.fromJson(Map<String, dynamic> j) => InventoryPayload(
        projects: ((j['projects'] as List?) ?? [])
            .map((e) => Project.fromJson(e as Map<String, dynamic>))
            .toList(),
        unitStatusMeta: ((j['unitStatusMeta'] as Map?) ?? {})
            .map((k, v) => MapEntry(k, StatusMeta.fromJson(v as Map<String, dynamic>))),
      );
}

class Quote {
  Quote({
    required this.id,
    required this.quoteNo,
    required this.customer,
    required this.project,
    required this.unit,
    required this.base,
    required this.discountPct,
    required this.total,
    required this.status,
    required this.salesExecutive,
    required this.segment,
    required this.createdAt,
  });

  final String id;
  final String quoteNo;
  final String customer;
  final String project;
  final String unit;
  final num base;
  final num discountPct;
  final num total;
  final String status;
  final String salesExecutive;
  final String segment;
  final String createdAt;

  factory Quote.fromJson(Map<String, dynamic> j) => Quote(
        id: j['id'] as String? ?? '',
        quoteNo: j['quoteNo'] as String? ?? '',
        customer: j['customer'] as String? ?? '',
        project: j['project'] as String? ?? '',
        unit: j['unit'] as String? ?? '',
        base: (j['base'] as num?) ?? 0,
        discountPct: (j['discountPct'] as num?) ?? 0,
        total: (j['total'] as num?) ?? 0,
        status: j['status'] as String? ?? 'draft',
        salesExecutive: j['salesExecutive'] as String? ?? '',
        segment: j['segment'] as String? ?? 'apartments',
        createdAt: j['createdAt'] as String? ?? '',
      );
}

class Milestone {
  Milestone({
    required this.id,
    required this.name,
    required this.planned,
    this.actual,
    required this.progress,
    required this.status,
  });

  final String id;
  final String name;
  final String planned;
  final String? actual;
  final int progress;
  final String status;

  factory Milestone.fromJson(Map<String, dynamic> j) => Milestone(
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        planned: j['planned'] as String? ?? '',
        actual: j['actual'] as String?,
        progress: (j['progress'] as num?)?.toInt() ?? 0,
        status: j['status'] as String? ?? 'pending',
      );
}

class PortalUnit {
  PortalUnit({
    required this.no,
    required this.project,
    required this.type,
    required this.sqft,
    required this.floor,
    required this.price,
  });

  final String no;
  final String project;
  final String type;
  final num sqft;
  final String floor;
  final num price;

  factory PortalUnit.fromJson(Map<String, dynamic> j) => PortalUnit(
        no: j['no'] as String? ?? '',
        project: j['project'] as String? ?? '',
        type: j['type'] as String? ?? '',
        sqft: (j['sqft'] as num?) ?? 0,
        floor: j['floor'] as String? ?? '',
        price: (j['price'] as num?) ?? 0,
      );
}

class PortalInstalment {
  PortalInstalment({
    required this.id,
    required this.name,
    required this.due,
    required this.amount,
    required this.paid,
    required this.paidOn,
  });

  final String id;
  final String name;
  final String due;
  final num amount;
  final bool paid;
  final String paidOn;

  factory PortalInstalment.fromJson(Map<String, dynamic> j) => PortalInstalment(
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        due: j['due'] as String? ?? '',
        amount: (j['amount'] as num?) ?? 0,
        paid: j['paid'] as bool? ?? false,
        paidOn: j['paidOn'] as String? ?? '',
      );
}

class PortalDoc {
  PortalDoc({required this.name, required this.tag});
  final String name;
  final String tag;

  factory PortalDoc.fromJson(Map<String, dynamic> j) => PortalDoc(
        name: j['name'] as String? ?? '',
        tag: j['tag'] as String? ?? '',
      );
}

class UnitAmenity {
  UnitAmenity({required this.kind, required this.name, this.detail});
  final String kind;
  final String name;
  final String? detail;

  factory UnitAmenity.fromJson(Map<String, dynamic> j) => UnitAmenity(
        kind: j['kind'] as String? ?? '',
        name: j['name'] as String? ?? '',
        detail: j['detail'] as String?,
      );
}

class PortalReceipt {
  PortalReceipt({
    required this.no,
    required this.date,
    required this.desc,
    required this.amount,
    required this.mode,
  });

  final String no;
  final String date;
  final String desc;
  final num amount;
  final String mode;

  factory PortalReceipt.fromJson(Map<String, dynamic> j) => PortalReceipt(
        no: j['no'] as String? ?? '',
        date: j['date'] as String? ?? '',
        desc: j['desc'] as String? ?? '',
        amount: (j['amount'] as num?) ?? 0,
        mode: j['mode'] as String? ?? '',
      );
}

class PortalLedger {
  PortalLedger({
    required this.total,
    required this.paid,
    required this.due,
    required this.paidPct,
    required this.receipts,
  });

  final num total;
  final num paid;
  final num due;
  final int paidPct;
  final List<PortalReceipt> receipts;

  factory PortalLedger.fromJson(Map<String, dynamic> j) => PortalLedger(
        total: (j['total'] as num?) ?? 0,
        paid: (j['paid'] as num?) ?? 0,
        due: (j['due'] as num?) ?? 0,
        paidPct: (j['paidPct'] as num?)?.toInt() ?? 0,
        receipts: ((j['receipts'] as List?) ?? [])
            .map((e) => PortalReceipt.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class PortalUpdate {
  PortalUpdate({
    required this.date,
    required this.tower,
    required this.progress,
    required this.note,
    required this.engineer,
  });

  final String date;
  final String tower;
  final int progress;
  final String note;
  final String engineer;

  factory PortalUpdate.fromJson(Map<String, dynamic> j) => PortalUpdate(
        date: j['date'] as String? ?? '',
        tower: j['tower'] as String? ?? '',
        progress: (j['progress'] as num?)?.toInt() ?? 0,
        note: j['note'] as String? ?? '',
        engineer: j['engineer'] as String? ?? '',
      );
}

class PortalTicket {
  PortalTicket({
    required this.id,
    required this.no,
    required this.category,
    required this.subject,
    required this.priority,
    required this.status,
    required this.ageDays,
  });

  final String id;
  final String no;
  final String category;
  final String subject;
  final String priority;
  final String status;
  final int ageDays;

  factory PortalTicket.fromJson(Map<String, dynamic> j) => PortalTicket(
        id: j['id'] as String? ?? '',
        no: j['no'] as String? ?? '',
        category: j['category'] as String? ?? '',
        subject: j['subject'] as String? ?? '',
        priority: j['priority'] as String? ?? 'medium',
        status: j['status'] as String? ?? 'open',
        ageDays: (j['ageDays'] as num?)?.toInt() ?? 0,
      );
}

class PortalPossessionStep {
  PortalPossessionStep({required this.name, required this.status, this.date});
  final String name;
  final String status;
  final String? date;

  factory PortalPossessionStep.fromJson(Map<String, dynamic> j) =>
      PortalPossessionStep(
        name: j['name'] as String? ?? '',
        status: j['status'] as String? ?? 'pending',
        date: j['date'] as String?,
      );
}

class PortalSnag {
  PortalSnag({
    required this.id,
    required this.no,
    required this.title,
    required this.category,
    required this.status,
    required this.raised,
  });

  final String id;
  final String no;
  final String title;
  final String category;
  final String status;
  final String raised;

  factory PortalSnag.fromJson(Map<String, dynamic> j) => PortalSnag(
        id: j['id'] as String? ?? '',
        no: j['no'] as String? ?? '',
        title: j['title'] as String? ?? '',
        category: j['category'] as String? ?? '',
        status: j['status'] as String? ?? 'open',
        raised: j['raised'] as String? ?? '',
      );
}

class PortalPossession {
  PortalPossession({
    required this.steps,
    required this.snags,
    required this.possessionDate,
    required this.signed,
  });

  final List<PortalPossessionStep> steps;
  final List<PortalSnag> snags;
  final String possessionDate;
  final List<String> signed;

  factory PortalPossession.fromJson(Map<String, dynamic> j) => PortalPossession(
        steps: ((j['steps'] as List?) ?? [])
            .map((e) => PortalPossessionStep.fromJson(e as Map<String, dynamic>))
            .toList(),
        snags: ((j['snags'] as List?) ?? [])
            .map((e) => PortalSnag.fromJson(e as Map<String, dynamic>))
            .toList(),
        possessionDate: j['possessionDate'] as String? ?? '',
        signed: ((j['signed'] as List?) ?? []).cast<String>(),
      );
}

class PortalReferral {
  PortalReferral({
    required this.id,
    required this.name,
    required this.phone,
    required this.status,
    required this.reward,
  });

  final String id;
  final String name;
  final String phone;
  final String status;
  final num reward;

  factory PortalReferral.fromJson(Map<String, dynamic> j) => PortalReferral(
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        phone: j['phone'] as String? ?? '',
        status: j['status'] as String? ?? '',
        reward: (j['reward'] as num?) ?? 0,
      );
}

class PortalReferralProgram {
  PortalReferralProgram({
    required this.code,
    required this.reward,
    required this.earned,
    required this.referred,
  });

  final String code;
  final num reward;
  final num earned;
  final List<PortalReferral> referred;

  factory PortalReferralProgram.fromJson(Map<String, dynamic> j) =>
      PortalReferralProgram(
        code: j['code'] as String? ?? '',
        reward: (j['reward'] as num?) ?? 0,
        earned: (j['earned'] as num?) ?? 0,
        referred: ((j['referred'] as List?) ?? [])
            .map((e) => PortalReferral.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class PortalPhoto {
  PortalPhoto({
    required this.id,
    required this.mediaType,
    required this.url,
    this.thumb,
    required this.caption,
    required this.shotOn,
  });

  final String id;
  final String mediaType;
  final String url;
  final String? thumb;
  final String caption;
  final String shotOn;

  factory PortalPhoto.fromJson(Map<String, dynamic> j) => PortalPhoto(
        id: j['id'] as String? ?? '',
        mediaType: j['mediaType'] as String? ?? 'photo',
        url: j['url'] as String? ?? '',
        thumb: j['thumb'] as String?,
        caption: j['caption'] as String? ?? '',
        shotOn: j['shotOn'] as String? ?? '',
      );
}

class PortalTax {
  PortalTax({
    required this.baseAmount,
    required this.cgst,
    required this.sgst,
    required this.igst,
    required this.tds,
    required this.total,
  });

  final num baseAmount;
  final num cgst;
  final num sgst;
  final num igst;
  final num tds;
  final num total;

  factory PortalTax.fromJson(Map<String, dynamic> j) => PortalTax(
        baseAmount: (j['baseAmount'] as num?) ?? 0,
        cgst: (j['cgst'] as num?) ?? 0,
        sgst: (j['sgst'] as num?) ?? 0,
        igst: (j['igst'] as num?) ?? 0,
        tds: (j['tds'] as num?) ?? 0,
        total: (j['total'] as num?) ?? 0,
      );
}

class PortalLoanPartner {
  PortalLoanPartner({
    required this.id,
    required this.name,
    required this.category,
    required this.city,
    required this.rating,
    required this.deals,
    required this.conversion,
    required this.verified,
    required this.services,
  });

  final String id;
  final String name;
  final String category;
  final String city;
  final num rating;
  final num deals;
  final num conversion;
  final bool verified;
  final List<String> services;

  factory PortalLoanPartner.fromJson(Map<String, dynamic> j) => PortalLoanPartner(
        id: j['id'] as String? ?? '',
        name: j['name'] as String? ?? '',
        category: j['category'] as String? ?? '',
        city: j['city'] as String? ?? '',
        rating: (j['rating'] as num?) ?? 0,
        deals: (j['deals'] as num?) ?? 0,
        conversion: (j['conversion'] as num?) ?? 0,
        verified: j['verified'] as bool? ?? false,
        services: ((j['services'] as List?) ?? []).cast<String>(),
      );
}

class PortalEvent {
  PortalEvent({
    required this.id,
    required this.title,
    required this.type,
    required this.description,
    required this.startsAt,
    required this.location,
    required this.capacity,
    this.rsvp,
  });

  final String id;
  final String title;
  final String type;
  final String description;
  final String startsAt;
  final String location;
  final int capacity;
  final String? rsvp;

  factory PortalEvent.fromJson(Map<String, dynamic> j) => PortalEvent(
        id: j['id'] as String? ?? '',
        title: j['title'] as String? ?? '',
        type: j['type'] as String? ?? '',
        description: j['description'] as String? ?? '',
        startsAt: j['startsAt'] as String? ?? '',
        location: j['location'] as String? ?? '',
        capacity: (j['capacity'] as num?)?.toInt() ?? 0,
        rsvp: j['rsvp'] as String?,
      );
}

class PortalWarrantyDoc {
  PortalWarrantyDoc({
    required this.id,
    required this.title,
    required this.status,
    required this.issued,
  });

  final String id;
  final String title;
  final String status;
  final String issued;

  factory PortalWarrantyDoc.fromJson(Map<String, dynamic> j) => PortalWarrantyDoc(
        id: j['id'] as String? ?? '',
        title: j['title'] as String? ?? '',
        status: j['status'] as String? ?? '',
        issued: j['issued'] as String? ?? '',
      );
}

class PortalLoyalty {
  PortalLoyalty({
    required this.points,
    required this.tier,
    required this.perks,
  });

  final int points;
  final String tier;
  final List<String> perks;

  factory PortalLoyalty.fromJson(Map<String, dynamic> j) => PortalLoyalty(
        points: (j['points'] as num?)?.toInt() ?? 0,
        tier: j['tier'] as String? ?? 'member',
        perks: ((j['perks'] as List?) ?? []).cast<String>(),
      );
}

class PortalKyc {
  PortalKyc({
    required this.status,
    required this.pan,
    required this.aadhaarLast4,
  });

  final String status;
  final String pan;
  final String aadhaarLast4;

  factory PortalKyc.fromJson(Map<String, dynamic> j) => PortalKyc(
        status: j['status'] as String? ?? 'pending',
        pan: j['pan'] as String? ?? '',
        aadhaarLast4: j['aadhaarLast4'] as String? ?? '',
      );
}

class PortalResaleListing {
  PortalResaleListing({
    required this.id,
    required this.listingType,
    required this.title,
    required this.description,
    required this.price,
    required this.status,
  });

  final String id;
  final String listingType;
  final String title;
  final String description;
  final num price;
  final String status;

  factory PortalResaleListing.fromJson(Map<String, dynamic> j) =>
      PortalResaleListing(
        id: j['id'] as String? ?? '',
        listingType: j['listingType'] as String? ?? 'sale',
        title: j['title'] as String? ?? '',
        description: j['description'] as String? ?? '',
        price: (j['price'] as num?) ?? 0,
        status: j['status'] as String? ?? 'draft',
      );
}

class PortalChatMessage {
  PortalChatMessage({required this.from, required this.text});
  final String from;
  final String text;

  factory PortalChatMessage.fromJson(Map<String, dynamic> j) => PortalChatMessage(
        from: j['from'] as String? ?? 'ai',
        text: j['text'] as String? ?? '',
      );
}

class PortalPayload {
  PortalPayload({
    required this.milestones,
    required this.unit,
    required this.instalments,
    required this.docs,
    required this.amenities,
    required this.ledger,
    required this.updates,
    required this.tickets,
    required this.possession,
    required this.referrals,
    required this.photos,
    required this.tax,
    required this.loanPartners,
    required this.events,
    required this.warranty,
    required this.loyalty,
    required this.kyc,
    required this.listings,
    required this.chat,
  });

  final List<Milestone> milestones;
  final PortalUnit unit;
  final List<PortalInstalment> instalments;
  final List<PortalDoc> docs;
  final List<UnitAmenity> amenities;
  final PortalLedger ledger;
  final List<PortalUpdate> updates;
  final List<PortalTicket> tickets;
  final PortalPossession possession;
  final PortalReferralProgram referrals;
  final List<PortalPhoto> photos;
  final PortalTax tax;
  final List<PortalLoanPartner> loanPartners;
  final List<PortalEvent> events;
  final List<PortalWarrantyDoc> warranty;
  final PortalLoyalty loyalty;
  final PortalKyc kyc;
  final List<PortalResaleListing> listings;
  final List<PortalChatMessage> chat;

  factory PortalPayload.fromJson(Map<String, dynamic> j) => PortalPayload(
        milestones: ((j['milestones'] as List?) ?? [])
            .map((e) => Milestone.fromJson(e as Map<String, dynamic>))
            .toList(),
        unit: PortalUnit.fromJson((j['unit'] as Map<String, dynamic>?) ?? {}),
        instalments: ((j['instalments'] as List?) ?? [])
            .map((e) => PortalInstalment.fromJson(e as Map<String, dynamic>))
            .toList(),
        docs: ((j['docs'] as List?) ?? [])
            .map((e) => PortalDoc.fromJson(e as Map<String, dynamic>))
            .toList(),
        amenities: ((j['amenities'] as List?) ?? [])
            .map((e) => UnitAmenity.fromJson(e as Map<String, dynamic>))
            .toList(),
        ledger: PortalLedger.fromJson((j['ledger'] as Map<String, dynamic>?) ?? {}),
        updates: ((j['updates'] as List?) ?? [])
            .map((e) => PortalUpdate.fromJson(e as Map<String, dynamic>))
            .toList(),
        tickets: ((j['tickets'] as List?) ?? [])
            .map((e) => PortalTicket.fromJson(e as Map<String, dynamic>))
            .toList(),
        possession:
            PortalPossession.fromJson((j['possession'] as Map<String, dynamic>?) ?? {}),
        referrals:
            PortalReferralProgram.fromJson((j['referrals'] as Map<String, dynamic>?) ?? {}),
        photos: ((j['photos'] as List?) ?? [])
            .map((e) => PortalPhoto.fromJson(e as Map<String, dynamic>))
            .toList(),
        tax: PortalTax.fromJson((j['tax'] as Map<String, dynamic>?) ?? {}),
        loanPartners: ((j['loanPartners'] as List?) ?? [])
            .map((e) => PortalLoanPartner.fromJson(e as Map<String, dynamic>))
            .toList(),
        events: ((j['events'] as List?) ?? [])
            .map((e) => PortalEvent.fromJson(e as Map<String, dynamic>))
            .toList(),
        warranty: ((j['warranty'] as List?) ?? [])
            .map((e) => PortalWarrantyDoc.fromJson(e as Map<String, dynamic>))
            .toList(),
        loyalty: PortalLoyalty.fromJson((j['loyalty'] as Map<String, dynamic>?) ?? {}),
        kyc: PortalKyc.fromJson((j['kyc'] as Map<String, dynamic>?) ?? {}),
        listings: ((j['listings'] as List?) ?? [])
            .map((e) => PortalResaleListing.fromJson(e as Map<String, dynamic>))
            .toList(),
        chat: ((j['chat'] as List?) ?? [])
            .map((e) => PortalChatMessage.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
